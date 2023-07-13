import { Formik, Form } from 'formik'
import { useState } from 'react'
import MyTextInput from './MyTextInput'
import * as Yup from 'yup';
import { FormValues, LineItem } from '../models/LineItem';
import { Button, Container, Header, Segment, Table } from 'semantic-ui-react';

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
    const existingItemIndex = items.findIndex(item => item.name === newItem.name);

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
            <MyTextInput name='name' placeholder='Asortyment'/>
            <MyTextInput name='weightBrutto' placeholder='Waga brutto'/>
            <MyTextInput name='containers' placeholder='Liczba pojemników'/>
            <MyTextInput name='pallets' placeholder='Liczba palet'/>
            <Button type='submit' content='Dodaj' positive/>
            <Button type='reset' content='Wyczyść' negative onClick={() => setItems([])} />
          </Form>
        )}
      </Formik>

      <Table celled  >
        <Table.Header>
            <Table.HeaderCell>Asortyment</Table.HeaderCell>
            <Table.HeaderCell>Waga Brutto</Table.HeaderCell>
            <Table.HeaderCell>Pojemniki</Table.HeaderCell>
            <Table.HeaderCell>Palety</Table.HeaderCell>
            <Table.HeaderCell>Waga Netto</Table.HeaderCell>
            {showFV ? <Table.HeaderCell>Waga FV</Table.HeaderCell> : null}
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
        </Table.Footer>
      </Table>
      <Container fluid style={{display: 'flex', justifyContent: 'right'}}>
        <Button.Group>
          <Button icon='eye' positive disabled={showFV} onClick={() => setShowFV(true)}/>
          <Button icon='eye slash' negative disabled={!showFV} onClick={() => setShowFV(false)}/>
        </Button.Group>
      </Container>
    </>
  )
}

export default WeightForm