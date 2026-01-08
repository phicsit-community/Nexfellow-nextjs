import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

//components
import EditQuiz from '../../Components/EditQuiz/EditQuiz'
import Navbar from '../../Components/Navbar/Navbar'

//styles
import styles from './Edit.module.css'

const Edit = () => {
  const { id } = useParams()

  const [quiz, setQuiz] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      const apiUrl = import.meta.env.VITE_API_URL
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${apiUrl}/admin/getquiz/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setQuiz(data)
        } else {
          console.error('Failed to fetch quiz. Status:', response.status)
        }
      } catch (error) {
        setError('Failed to fetch quiz:', error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [id])

  return (
    <div>
      <Navbar />
      {
        loading ? <p>Loading...</p> : error ? <p>{error}</p> : <EditQuiz quiz={quiz} />
      }
    </div>
  )
}

export default Edit