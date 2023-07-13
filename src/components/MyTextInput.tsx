import { useField } from 'formik'
import { Form, Label } from 'semantic-ui-react'

interface Props {
  placeholder: string,
  name: string,
  label?: string,
  type?: string,
}

function MyTextInput(props: Props) {
  const [field, meta] = useField(props.name)

  return (
    <Form.Field error={meta.touched && !!meta.error}>
      {props.label &&
        <Label>{props.label}</Label>}
      <input style={{textAlign: 'center'}} {...field} {...props} />
      {meta.touched && meta.error ? (
        <Label basic color='red'>{meta.error}</Label>
      ) : null}
    </Form.Field>
  )
}

export default MyTextInput