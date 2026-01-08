import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  border: 2px solid #b2e8a2;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f9fff6;
  }
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const Date = styled.p`
  font-size: 12px;
  font-weight: 400;
  margin: 0;
`;




const Card = ({subject, date}) => {
  return (
    <Container>
      <Title>{subject.length > 24 ? `${subject.slice(0, 24)}..`: subject}</Title>
      <Date>{date}</Date>
    </Container>
  )
}

export default Card