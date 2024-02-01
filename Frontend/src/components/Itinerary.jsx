import React, { useState } from 'react';
import Locations from './Locations';
import Hotels from './Hotels';
import Restaurants from './Restaurants';
import Bus from './Bus';
import { HiPaperAirplane } from 'react-icons/hi2'
import BusReturn from './BusReturn';
import { useLocation } from 'react-router-dom';
import Flight from './Flight';
import FlightReturn from './FlightReturn';
import Trains from './Trains';
import TrainsReturn from './TrainsReturn';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Itinerary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const itineraryData = location.state?.itineraryData;

    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    // Inside the component function, add these functions
    const handleHotelSelection = (selectedHotel) => {
        setSelectedHotel(selectedHotel);
        // You can also perform any other actions related to hotel selection here
    };

    const handleRestaurantSelection = (selectedRestaurant) => {
        setSelectedRestaurant(selectedRestaurant);
        // You can also perform any other actions related to restaurant selection here
    };

    /*new code*/
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(18000);
    const [filteredHotels, setFilteredHotels] = useState(itineraryData?.itinerary.hotels || []);
    const [filteredRestaurants, setFilteredRestaurants] = useState(itineraryData?.itinerary.restaurants || []);

    const handlePriceRangeChange = (min, max, itemType) => {
        setMinPrice(min);
        setMaxPrice(max);

        // Filter items based on the selected price range and item type
        const filteredItems = itineraryData?.itinerary[itemType]?.filter(item => item.price >= min && item.price <= max) || [];

        if (itemType === 'hotels') {
            setFilteredHotels(filteredItems);
        } else if (itemType === 'restaurants') {
            setFilteredRestaurants(filteredItems);
        }
    };

    const showAllItems = (itemType) => {
        // Show all items for the given item type
        if (itemType === 'hotels') {
            setFilteredHotels(itineraryData?.itinerary.hotels || []);
        } else if (itemType === 'restaurants') {
            setFilteredRestaurants(itineraryData?.itinerary.restaurants || []);
        }
    };

    /*ends here*/

    if (!itineraryData) {
        return <div>No itinerary data available.</div>;
    }

    const transportationTypes = itineraryData?.itinerary.transportation?.map((item) => item?.type);
    const return_transportationTypes = itineraryData?.itinerary.return_transportation?.map((item) => item?.type);

    // Determine which mode has the lowest price for the initial and return journeys separately

    let lowestPriceModeInitial = '';
    let lowestPriceModeReturn = '';

    if (transportationTypes.includes('Bus')) {
        lowestPriceModeInitial = 'bus';
    } else if (transportationTypes.includes('Flight')) {
        lowestPriceModeInitial = 'flight';
    } else {
        lowestPriceModeInitial = 'train';
    }

    if (return_transportationTypes.includes('Bus')) {
        lowestPriceModeReturn = 'bus';
    } else if (return_transportationTypes.includes('Flight')) {
        lowestPriceModeReturn = 'flight';
    } else {
        lowestPriceModeReturn = 'train';
    }

    const confirmItinerary = () => {
        if (!selectedHotel || !selectedRestaurant) {
            // Show an error notification if hotel or restaurant is not selected
            toast.error('Please select a hotel and a restaurant before confirming the itinerary.', { autoClose: 3000 });
            return;
        }

        const selectedHotelPrice = selectedHotel ? selectedHotel.price : 0;
        const selectedRestaurantPrice = selectedRestaurant ? selectedRestaurant.price : 0;

        const totalTransportationCost = itineraryData?.total_cost.transportation || 0;
        const totalHotelCost = selectedHotelPrice;
        const totalFoodCost = selectedRestaurantPrice;
        const totalCost = totalTransportationCost + totalHotelCost + totalFoodCost;

        toast.success('confirming the itinerary.', { autoClose: 3000 });

        setTimeout(() => {
            navigate('/confirmed-itinerary', {
                state: {
                    itineraryData,
                    selectedHotel,
                    selectedRestaurant,
                    totalCost,
                },
            });
        }, 4000);
    };


    const selectedHotelPrice = selectedHotel ? selectedHotel.price : 0;
    const selectedRestaurantPrice = selectedRestaurant ? selectedRestaurant.price : 0;

    const totalTransportationCost = itineraryData?.total_cost.transportation || 0;
    const totalHotelCost = selectedHotelPrice;
    const totalFoodCost = selectedRestaurantPrice;
    const totalCost = totalTransportationCost + totalHotelCost + totalFoodCost;


    return (
        <div className='container-new'>
            <h1 className='head-1'>Travel in Mumbai</h1>
            <div className='sub-head'>
                <HiPaperAirplane className='sub-head-img' />
                <h3 className='head-2'>Itinerary</h3>
            </div>

            <div>
                {itineraryData?.itinerary.attractions?.length > 0 ? (
                    <div className="locations-container">
                        {itineraryData?.itinerary.attractions?.map((item, index) => (
                            <Locations key={index} item={item} index={index} />
                        ))}
                    </div>
                ) : (
                    <p>No data available</p>
                )}
            </div>
            <hr />

            <h2 className='all-sub-head'>Hotels:</h2>
            <div className='hotel-card'>
                <div className="filters">
                    <button className="range" onClick={() => showAllItems('hotels')}>All</button>
                    <button className="range" onClick={() => handlePriceRangeChange(1500, 3000, 'hotels')}>1500-3000</button>
                    <button className="range" onClick={() => handlePriceRangeChange(3000, 6000, 'hotels')}>3000-6000</button>
                    <button className="range" onClick={() => handlePriceRangeChange(6000, 9000, 'hotels')}>6000-9000</button>
                    <button className="range" onClick={() => handlePriceRangeChange(9000, 12000, 'hotels')}>9000-12000</button>
                    <button className="range" onClick={() => handlePriceRangeChange(12000, 15000, 'hotels')}>12000-15000</button>
                    <button className="range" onClick={() => handlePriceRangeChange(15000, 18000, 'hotels')}>15000-18000</button>
                </div>
                <div className="content-card">
                    {filteredHotels.length > 0 ? (
                        filteredHotels.map((hotel, index) => (
                            <Hotels
                                key={index}
                                item={hotel}
                                isSelected={selectedHotel === hotel} // Add this line to check if the hotel is selected
                                onSelect={() => handleHotelSelection(hotel)}
                            />
                        ))
                    ) : (
                        <p>No hotels are available at this price</p>
                    )}
                </div>
            </div>
            <hr />

            <h2 className='all-sub-head'>Restaurants:</h2>
            <div className='hotel-card'>
                <div className="filters">
                    <button className="range" onClick={() => showAllItems('restaurants')}>All</button>
                    <button className="range" onClick={() => handlePriceRangeChange(400, 700, 'restaurants')}>400-700</button>
                    <button className="range" onClick={() => handlePriceRangeChange(700, 1000, 'restaurants')}>700-1000</button>
                    <button className="range" onClick={() => handlePriceRangeChange(1000, 1200, 'restaurants')}>1000-1200</button>
                    <button className="range" onClick={() => handlePriceRangeChange(1200, 1500, 'restaurants')}>1200-1500</button>
                    <button className="range" onClick={() => handlePriceRangeChange(1500, 1800, 'restaurants')}>1500-1800</button>
                    <button className="range" onClick={() => handlePriceRangeChange(1800, 2000, 'restaurants')}>1800-2000</button>
                </div>
                <div className="content-card">
                    {filteredRestaurants.length > 0 ? (
                        filteredRestaurants.map((restaurant, index) => (
                            <Restaurants
                                key={index}
                                item={restaurant}
                                isSelected={selectedRestaurant === restaurant} // Add this line to check if the restaurant is selected
                                onSelect={() => handleRestaurantSelection(restaurant)}
                            />
                        ))
                    ) : (
                        <p>No restaurants are available at this price</p>
                    )}
                </div>
            </div>

            <hr />
            <h2 className="all-sub-head">Travel Details :</h2>
            <div className="travel-details">
                {/* <h2 className='all-sub-head'>Bus Details:</h2> */}
                <div className='bus-card'>

                    <div className="sub-card">
                        {/* <h2 className="head-4">📤Bus from initial location</h2> */}
                        {lowestPriceModeInitial === 'bus' &&
                            itineraryData?.itinerary.transportation?.map((item, index) => <Bus key={index} item={item} />)
                        }
                    </div>

                    <div className="sub-card">
                        {/* <h2 className="head-4">📥Bus while returning</h2> */}
                        {lowestPriceModeReturn === 'bus' &&
                            itineraryData?.itinerary.return_transportation?.map((item, index) => <BusReturn key={index} item={item} />)
                        }
                    </div>
                </div>

                {/* <hr /> */}

                {/* <h2 className='all-sub-head'>Flight Details:</h2> */}
                <div className='flight-card'>
                    <div className="sub-card">
                        {/* <h2 className="head-4">✈️ Flight from initial location</h2> */}
                        {lowestPriceModeInitial === 'flight' &&
                            itineraryData?.itinerary.transportation?.map((item, index) => <Flight key={index} item={item} />)
                        }
                    </div>

                    <div className="sub-card">
                        {/* <h2 className="head-4">✈️ Flight while returning</h2> */}
                        {lowestPriceModeReturn === 'flight' &&
                            itineraryData?.itinerary.return_transportation?.map((item, index) => <FlightReturn key={index} item={item} />)
                        }
                    </div>
                </div>

                {/* <hr /> */}

                {/* <h2 className='all-sub-head'>Trains:</h2> */}
                <div className="train-card">
                    <div className='sub-card'>
                        {/* <h2 className="head-4">🚊 Train from initial location</h2> */}
                        {lowestPriceModeInitial === 'train' &&
                            itineraryData?.itinerary.transportation?.map((item, index) => <Trains key={index} item={item} />)
                        }
                    </div>

                    <div className='sub-card'>
                        {/* <h2 className="head-4">🚊 Train while returning</h2> */}
                        {lowestPriceModeReturn === 'train' &&
                            itineraryData?.itinerary.return_transportation?.map((item, index) => <TrainsReturn key={index} item={item} />)
                        }
                    </div>
                </div>
            </div>
            <hr />
            <h1 className='all-sub-head'>Estimated Cost (INR)</h1>
            <p>Transportation: {itineraryData?.total_cost.transportation}</p>
            <p>Hotel: {selectedHotel ? selectedHotel.price : 0}</p>
            <p>Food: {selectedRestaurant ? selectedRestaurant.price : 0}</p>
            <p>Total Cost: {totalCost}</p>

            <hr />

            <div className="link-button1">
                <a href="/plan">Generate Again</a> <span />
                <button onClick={confirmItinerary} className='download'>Confirm Itinerary</button>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Itinerary;