import { Container, Divider, Header, Segment } from 'semantic-ui-react';
import WeightForm from './components/WeightForm';
import { observer } from 'mobx-react-lite';

function App() {
  return (
    <Container fluid style={{height: '100vh', backgroundColor: '#F4F4F4', display: 'flex', justifyContent: 'center', alignItems:'center'}}>
      <Segment >
        <Header as='h1' textAlign='center' content='Kalkulator wag' />
        <Divider />
        <WeightForm/>
      </Segment>
    </Container>
  );
}

export default observer(App);
