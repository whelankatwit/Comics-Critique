import Banner from '../components/Banner'
import NavBar from '../components/NavBar'
import ReviewList from '../components/ReviewList'

function Reviews() {

  return (
    <div>
        <div className="bg-primary-subtle">
          <div className="text-center mt-16 p-4">
            <p>This is the Reviews page.</p>
          </div>
          <ReviewList />
        </div>
    </div>
    
  )
}

export default Reviews;