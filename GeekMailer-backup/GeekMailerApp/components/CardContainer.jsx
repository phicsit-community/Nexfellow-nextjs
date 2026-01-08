import styled from 'styled-components'

//components
import Card from './Card';

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
`;

const Heading = styled.div`
  display: flex;
  font-size: 24px;
  font-weight: 500;
`;

const MainContainer = styled.div`
  display: grid;
  padding: 10px;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const CardContainer = ({heading}) => {
  return (
    <Container>
      <Heading>{heading}</Heading>
      <MainContainer>
        <Card subject={"Hello world email asdasde asd asdadkasjdkasd asdasndkasjdk"} date={"05/07/2020"}/>
        <Card subject={"lessfooo"} date={"05/07/2020"}/>
        <Card subject={"lessfooo"} date={"05/07/2020"}/>
        <Card subject={"lessfooo"} date={"05/07/2020"}/>
        <Card subject={"lessfooo"} date={"05/07/2020"}/>
        <Card subject={"lessfooo"} date={"05/07/2020"}/>
      </MainContainer>
    </Container>
  )
}

export default CardContainer