import { Formik, Form } from 'formik'
import { useState } from 'react'
import MyTextInput from './MyTextInput'
import * as Yup from 'yup';
import { FormValues, LineItem } from '../models/LineItem';
import { Button, Container, Divider, Table } from 'semantic-ui-react';
import FileSaver from 'file-saver'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit'

function WeightForm() {
  const [items, setItems] = useState<LineItem[]>([])
  const [showFV, setShowFV] = useState(false)

  const addItem = (newItem: LineItem) => {
    setItems([...items, newItem])
  }

  const validationSchema = Yup.object({
    name: Yup.string().required('Asortyment wymagany'),
    containers: Yup.number().required('Liczba pojemników wymagana').moreThan(-1, 'Liczba pojemników musi być dodatnia'),
    weightBrutto: Yup.number().positive('Waga musi być dodatnia').required('Waga wymagana'),
    pallets: Yup.number().required('Liczba palet wymagana').moreThan(-1, 'Liczba palet musi być dodatnia')
  })

  const handleFormSubmit = (values: FormValues, { resetForm }: { resetForm: () => void }): any => {
    const newItem = new LineItem(values)
    const existingItemIndex = items.findIndex(item => item.name.toLowerCase() === newItem.name.toLowerCase());

    if (existingItemIndex !== -1) {
      const updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];

      existingItem.weightBrutto = +existingItem.weightBrutto + +newItem.weightBrutto;
      existingItem.containers = +existingItem.containers + +newItem.containers;
      existingItem.pallets = +existingItem.pallets + +newItem.pallets;
      existingItem.weightNetto = +existingItem.weightNetto + +newItem.weightNetto
      existingItem.weightFV = +existingItem.weightFV + +newItem.weightFV
      setItems(updatedItems);
    } else {
      addItem(newItem)
    }

    resetForm()
  }

  async function createFile() {
    const pdfDoc = await PDFDocument.create();

    const url = 'https://use.typekit.net/af/7f1b26/00000000000000007735a0ac/30/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3'
    const fontBytes = await fetch(url).then(res => res.arrayBuffer());

    pdfDoc.registerFontkit(fontkit)
    const font = await pdfDoc.embedFont(fontBytes);
    
    const page = pdfDoc.addPage();
    page.setFont(font);
    page.setFontSize(12);
    page.setFontColor(rgb(0, 0, 0));

    const table = {
      x: 50,
      y: page.getHeight() - 50,
      width: page.getWidth() - 100,
      height: page.getHeight() - 100,
      numberOfRows: items.length + 1,
      numberOfColumns: 6,
      cellMargin: 5,
      headerBackgroundColor: rgb(0.8, 0.8, 0.8),
    };

    drawTableHeader(page, table);

    await drawTableRows(page, table, pdfDoc);

    const pdfBytes = await pdfDoc.save();

    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    FileSaver.saveAs(pdfBlob, `Wagi_${new Date().toLocaleDateString()}_${new Date().toLocaleTimeString()}.pdf`);
  }

  function drawTableHeader(page: any, table: any) {
    const { x, y, width, numberOfColumns, cellMargin } = table;
    const columnWidth = width / numberOfColumns;
  
    let currentY = y - cellMargin - 10;
  
    page.drawLine({
      start: { x, y: currentY },
      end: { x: x + width, y: currentY },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    const headerTexts = ['Asortyment', 'Waga Brutto', 'Pojemniki', 'Palety', 'Waga Netto', 'Waga FV'];
    headerTexts.forEach((headerText, columnIndex) => {
      const textX = x + cellMargin + columnWidth * columnIndex;
      const textY = y + cellMargin - 8;
      page.drawText(headerText, { x: textX, y: textY });
    });
  }

  async function drawTableRows(page: any, table: any, pdfDoc: PDFDocument) {
    const { x, y, width, numberOfColumns, cellMargin } = table;
    const columnWidth = width / numberOfColumns;
  
    let currentY = y - cellMargin - 25;

    const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    page.setFont(fontB)

    items.forEach((item) => {
      item.name = replacePolishLetters(item.name)
      const rowValues = [
        item.name,
        item.weightBrutto.toString(),
        item.containers.toString(),
        item.pallets.toString(),
        item.weightNetto.toString(),
        item.weightFV.toString(),
      ];
      
  
      rowValues.forEach((value, columnIndex) => {
        const textX = x + cellMargin + columnWidth * columnIndex;
        page.drawText(value, { x: textX, y: currentY });
      });
  
      currentY -= cellMargin + 15;
    });

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.setFont(font)
  
    const sumRow = calculateSumRow();
    const sumRowValues = ['Suma', ...sumRow];
  
    page.drawLine({
      start: { x, y: currentY + 10 },
      end: { x: x + width, y: currentY + 10},
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  
    sumRowValues.forEach((value, columnIndex) => {
      const textX = x + cellMargin + columnWidth * columnIndex;
      page.drawText(value, { x: textX, y: currentY - cellMargin - 2 });
    });
  }

  function calculateSumRow(): string[] {
    const sumRow: number[] = Array(5).fill(0);
  
    items.forEach((lineItem) => {
      sumRow[0] += +lineItem.weightBrutto;
      sumRow[1] += +lineItem.containers;
      sumRow[2] += +lineItem.pallets;
      sumRow[3] += +lineItem.weightNetto;
      sumRow[4] += +lineItem.weightFV;
    });
    return sumRow.map((value) => value.toString());
  }

  async function downloadTable(): Promise<void> {
    await createFile()
  }

  function handleLiDelete(item: LineItem): void {
    setItems(items.filter((li) => li !== item))
  }

  function replacePolishLetters(word: string): string {
    let replacedWord = "";
  
    for (let i = 0; i < word.length; i++) {
      const currentChar = word[i];
  
      switch (currentChar) {
        case "ś":
          replacedWord += "s";
          break;
        case "ą":
          replacedWord += "a";
          break;
        case "ę":
          replacedWord += "e";
          break;
        case "ż":
        case "ź":
          replacedWord += "z";
          break;
        case "ć":
          replacedWord += "c";
          break;
        case "ń":
          replacedWord += "n";
          break;
        case "ł":
          replacedWord += "l";
          break;
        case "ó":
          replacedWord += "o";
          break;
        default:
          replacedWord += currentChar;
          break;
      }
    }
  
    return replacedWord;
  }

  // Dodać zmianę wagi FV w trakcie wprowadzania asortymentu

  return (
    <>
      <Formik
        validationSchema={validationSchema}
        initialValues={new FormValues()}
        onSubmit={handleFormSubmit}>
        {({handleSubmit, isSubmitting, errors}) => (
          <Form 
          style={{textAlign: 'center'}}
          className='ui form' 
          onSubmit={handleSubmit}
          autoComplete='off'>
            <MyTextInput name='name' placeholder='Asortyment' />
            <MyTextInput name='weightBrutto' placeholder='Waga brutto'/>
            <MyTextInput name='containers' placeholder='Liczba pojemników'/>
            <MyTextInput name='pallets' placeholder='Liczba palet'/>
            <Button type='submit' content='Dodaj' positive/>
            <Button type='reset' content='Wyczyść' negative onClick={() => setItems([])} />
          </Form>
        )}
      </Formik>

      <Divider/>

      <Table celled  >
        <Table.Header>
            <Table.HeaderCell>Asortyment</Table.HeaderCell>
            <Table.HeaderCell>Waga Brutto</Table.HeaderCell>
            <Table.HeaderCell>Pojemniki</Table.HeaderCell>
            <Table.HeaderCell>Palety</Table.HeaderCell>
            <Table.HeaderCell>Waga Netto</Table.HeaderCell>
            {showFV ? <Table.HeaderCell>Waga FV</Table.HeaderCell> : null}
            <Table.HeaderCell></Table.HeaderCell>
        </Table.Header>

        <Table.Body>
          {items.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>{item.weightBrutto}</Table.Cell>
                <Table.Cell>{item.containers}</Table.Cell>
                <Table.Cell>{item.pallets}</Table.Cell>
                <Table.Cell>{item.weightNetto}</Table.Cell>
                {showFV ? <Table.Cell>{item.weightFV}</Table.Cell> : null}
                <Table.Cell><Button negative circular icon='trash' size='mini' onClick={() => handleLiDelete(item)}/></Table.Cell>
              </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer style={{backgroundColor: '#F4F4F4'}}>
          <Table.Cell>Suma:</Table.Cell>
          <Table.Cell>{items.reduce((accumulator, item) => accumulator + (+item.weightBrutto), 0)}</Table.Cell>
          <Table.Cell>{items.reduce((accumulator, item) => accumulator + (+item.containers), 0)}</Table.Cell>
          <Table.Cell>{items.reduce((accumulator, item) => accumulator + (+item.pallets), 0)}</Table.Cell>
          <Table.Cell>{items.reduce((accumulator, item) => accumulator + (+item.weightNetto), 0)}</Table.Cell>
          {showFV ? <Table.Cell>{items.reduce((accumulator, item) => accumulator + (+item.weightFV), 0)}</Table.Cell> : null}
          <Table.Cell></Table.Cell>
        </Table.Footer>
      </Table>
      <Container fluid style={{display: 'flex', justifyContent: 'space-between'}}>
        <Button icon='save' color='blue' disabled={items.length <= 0} onClick={downloadTable}/>
        <Button.Group >
          <Button icon='eye' positive disabled={showFV} onClick={() => setShowFV(true)}/>
          <Button icon='eye slash' negative disabled={!showFV} onClick={() => setShowFV(false)}/>
        </Button.Group>
      </Container>
    </>
  )
}

export default WeightForm

