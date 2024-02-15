import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from './Loading';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function formatDateToDDMMYYYY(date) {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
}

function PlanTrip() {
    const [itineraryData, setItineraryData] = useState(null);
    const [transportationType, setTransportationType] = useState('bus');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // State variables for form fields
    const [start_location, setStart_location] = useState('');
    const [destination, setDestination] = useState('');
    const [date_of_departure, setDate_of_departure] = useState('');
    const [date_of_return, setDate_of_return] = useState('');
    const [duration_of_stay, setDuration_of_stay] = useState(1);
    const [budget, setBudget] = useState('');
    const [num_travelers, setNum_travelers] = useState(1);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [selectedNumTravelers, setSelectedNumTravelers] = useState(null);


    const handleTransportationChange = (event) => {
        setTransportationType(event.target.value);
    };

    const handleBudget = (value) => {
        setBudget(value);
    };

    const handleNum_travelers = (value) => {
        setNum_travelers(value);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target);
        const requestData = Object.fromEntries(formData.entries());

        requestData.budget = budget; // Set budget value
        requestData.num_travelers = num_travelers; // Set number of travelers value
        requestData.duration_of_stay = duration_of_stay; // Set duration of stay value
        requestData.date_of_departure = formatDateToDDMMYYYY(date_of_departure);
        requestData.date_of_return = formatDateToDDMMYYYY(date_of_return);

        try {
            const response = await axios.post('http://localhost:4000/generate-itinerary', requestData);
            setItineraryData(response.data);
            toast.success('Your Itinerary is generated successfully.');
            console.log(requestData);
            setTimeout(() => {
                navigate('/Itinerary', { state: { itineraryData: response.data } });
            }, 4000);
        } catch (err) {
            toast.error('Unable to generate itinerary. Please check your input.');
            setItineraryData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Create a new state variable to store the minimum date (tomorrow)
    const [minDate, setMinDate] = useState('');

    // Update the minimum date when the component mounts
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const year = tomorrow.getFullYear();
        const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
        const day = tomorrow.getDate().toString().padStart(2, '0');
        const formattedTomorrow = `${year}-${month}-${day}`;
        setMinDate(formattedTomorrow);
    }, []);

    // Create a new state variable to store the calculated duration of stay
    const [calculatedDuration, setCalculatedDuration] = useState('');

    // Update the calculated duration when departure and return dates change
    useEffect(() => {
        if (date_of_departure && date_of_return) {
            const departureDate = new Date(date_of_departure);
            const returnDate = new Date(date_of_return);
            const timeDifference = returnDate.getTime() - departureDate.getTime();
            const duration = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Calculate days
            setCalculatedDuration(duration);
            setDuration_of_stay(duration);
        }
    }, [date_of_departure, date_of_return]);

    return (
        <div className='container'>
            <form onSubmit={handleSubmit}>
                <section className='trip-content'>

                    <h1>Tell us your travel preferences</h1>

                    <p className='mid-text'>What is the starting location ?</p>
                    <div>
                        <select className='drop-down' name="start_location" required>
                            <option value="">Select City</option>
                            <option value="Bengaluru" name="start_location">Bengaluru</option>
                            <option value="Delhi" name="start_location">Delhi</option>
                            <option value="Indore" name="start_location">Indore</option>
                            <option value="Kolhapur" name="start_location">Kolhapur</option>
                            <option value="Nagpur" name="start_location">Nagpur</option>
                            <option value="Nashik" name="start_location">Nashik</option>
                            <option value="Panaji" name="start_location">Panaji</option>
                            <option value="Pune" name="start_location">Pune</option>

                        </select>
                    </div>
                    <p className='mid-text'>What is the transportation preference ?</p>
                    <div>
                        <select
                            className='drop-down'
                            name="transportationType"
                            value={transportationType}
                            onChange={handleTransportationChange}
                            required
                        >
                            <option value="bus">Bus</option>
                            <option value="train">Train</option>
                            <option value="flight">Flight</option>
                        </select>
                    </div>
                    <hr />

                    <p className='mid-text'>What is destination of choice ?</p>
                    <div>
                        <select className='drop-down' name="destination" required>
                            <option value="">Select City</option>
                            <option value="Mumbai" name="destination">Mumbai</option>

                        </select>
                    </div>
                    <hr />

                    <p className='mid-text'>When are you planning to travel ?</p>


                    <div className="datePickerDiv">
                        <input
                            type='date'
                            name="date_of_departure"
                            className='Date'
                            value={date_of_departure}
                            onChange={(event) => setDate_of_departure(event.target.value)}
                            required
                        // min={minDate} // Set the min attribute using ISO date format
                        />
                        <input
                            type='date'
                            name="date_of_return"
                            className='Date'
                            value={date_of_return}
                            onChange={(event) => setDate_of_return(event.target.value)}
                            min={date_of_departure}
                            required
                        />
                    </div>


                    <hr />

                    {/* <p className='mid-text'>How many days are you planning to travel ?</p> */}
                    <div className='day-count'>
                        {/* <p>Days:</p> */}
                        <input type="hidden" name="duration_of_stay" value={calculatedDuration} readOnly />
                    </div>
                    <hr />

                    {/* <p className='mid-text'>What's your budget ?</p>
                    <p>The budget is exclusively allocated for travelling and dining purposes.</p>

                    <input
                        id="budget"
                        name="budget"
                        type="text"
                        onChange={handleChange}
                        required
                    /> */}
                    <p className='mid-text'>What's your budget?</p>
                    <p>The budget is exclusively allocated for travelling and dining purposes.</p>

                    <div className='budget-options'>
                        <div className={`option-card ${budget === 20000 ? 'selected' : ''}`} onClick={() => handleBudget(20000)}>
                            <p>Low</p>
                            <span>&#8377; 0-20000</span>
                        </div>
                        <div className={`option-card ${budget === 50000 ? 'selected' : ''}`} onClick={() => handleBudget(50000)}>
                            <p>Medium</p>
                            <span>&#8377; 20000-50000</span>
                        </div>
                        <div className={`option-card ${budget === 75000 ? 'selected' : ''}`} onClick={() => handleBudget(75000)}>
                            <p>High</p>
                            <span>&#8377; 50000+</span>
                        </div>
                    </div>



                    <hr />

                    {/* <p className='mid-text'>What is the number of people travelling ?</p>
                    <div className='people-count'>
                        <input
                            id="num_travelers"
                            name="num_travelers"
                            type="number"
                            onChange={handleNum_travelers}
                            required
                            min="0"
                            max="15"
                        />
                    </div> */}
                    <p className='mid-text'>With whom are you plannig to travel?</p>
                    <div className='people-options'>
                        <div className={`option-card ${num_travelers === 1 ? 'selected' : ''}`} onClick={() => handleNum_travelers(1)}>
                            <p>Solo</p>
                        </div>
                        <div className={`option-card ${num_travelers === 2 ? 'selected' : ''}`} onClick={() => handleNum_travelers(2)}>
                            <p>Couple</p>
                        </div>
                        <div className={`option-card ${num_travelers === 3 ? 'selected' : ''}`} onClick={() => handleNum_travelers(3)}>
                            <p>Family</p>
                        </div>
                        <div className={`option-card ${num_travelers === 4 ? 'selected' : ''}`} onClick={() => handleNum_travelers(4)}>
                            <p>Friends</p>
                        </div>
                    </div>


                </section>

                <div className='submit'>
                    <button type="submit" className='btn-submit'>Submit</button>
                </div>

            </form>
            {isLoading && <Loading />}
            <ToastContainer autoClose={3000} />
        </div>
    );
}

export default PlanTrip