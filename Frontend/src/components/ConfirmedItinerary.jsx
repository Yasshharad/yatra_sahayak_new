import React, { useRef } from 'react';
import Locations from './Locations';
import Hotels from './Hotels';
import Restaurants from './Restaurants';
import Bus from './Bus';
import BusReturn from './BusReturn';
import Flight from './Flight';
import FlightReturn from './FlightReturn';
import Trains from './Trains';
import TrainsReturn from './TrainsReturn';
import { useLocation } from 'react-router-dom';
import { HiPaperAirplane } from 'react-icons/hi2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ConfirmedItinerary = () => {
    const location = useLocation();
    const itineraryData = location.state?.itineraryData;
    const selectedHotel = location.state?.selectedHotel;
    const selectedRestaurant = location.state?.selectedRestaurant;
    const pdfRef = useRef();

    if (!itineraryData) {
        return <div>No confirmed itinerary data available.</div>;
    }

    const transportationTypes = itineraryData?.itinerary.transportation?.map((item) => item?.type);
    const return_transportationTypes = itineraryData?.itinerary.return_transportation?.map((item) => item?.type);

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

    const downloadPDF = () => {
        const input = pdfRef.current;
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4', true);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 15;
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

            pdf.save('itinerary.pdf')

        });
    }

    // Calculate costs for ConfirmedItinerary
    const totalTransportationCost = itineraryData?.total_cost.transportation || 0;
    const totalHotelCost = selectedHotel ? selectedHotel.price : 0;
    const totalFoodCost = selectedRestaurant ? selectedRestaurant.price : 0;
    const totalCost = totalTransportationCost + totalHotelCost + totalFoodCost;

    return (
        <div className='container-new' ref={pdfRef}>
            <h1 className='head-1'>Confirmed Itinerary</h1>
            <div className='sub-head'>
                <HiPaperAirplane className='sub-head-img' />
                <h3 className='head-2'>Itinerary Details</h3>
            </div>

            {/* Display selected attractions */}
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

            {/* Display selected hotel */}
            <h2 className='all-sub-head'>Selected Hotel:</h2>
            {selectedHotel ? (
                <Hotels
                    item={selectedHotel}
                    isSelected={true}
                    onSelect={() => { }}
                />
            ) : (
                <p>No hotel selected</p>
            )}
            <hr />

            {/* Display selected restaurants */}
            <h2 className='all-sub-head'>Selected Restaurants:</h2>
            {selectedRestaurant ? (
                <Restaurants
                    item={selectedRestaurant}
                    isSelected={true}
                    onSelect={() => { }}
                />
            ) : (
                <p>No restaurant selected</p>
            )}
            <hr />

            {/* Display travel details */}
            <h2 className="all-sub-head">Travel Details :</h2>
            <div className="travel-details">
                <div className='bus-card'>
                    <div className="sub-card">
                        {lowestPriceModeInitial === 'bus' &&
                            itineraryData?.itinerary.transportation?.map((item, index) => <Bus key={index} item={item} />)
                        }
                    </div>
                    <div className="sub-card">
                        {lowestPriceModeReturn === 'bus' &&
                            itineraryData?.itinerary.return_transportation?.map((item, index) => <BusReturn key={index} item={item} />)
                        }
                    </div>
                </div>

                <div className='flight-card'>
                    <div className="sub-card">
                        {lowestPriceModeInitial === 'flight' &&
                            itineraryData?.itinerary.transportation?.map((item, index) => <Flight key={index} item={item} />)
                        }
                    </div>
                    <div className="sub-card">
                        {lowestPriceModeReturn === 'flight' &&
                            itineraryData?.itinerary.return_transportation?.map((item, index) => <FlightReturn key={index} item={item} />)
                        }
                    </div>
                </div>

                <div className="train-card">
                    <div className='sub-card'>
                        {lowestPriceModeInitial === 'train' &&
                            itineraryData?.itinerary.transportation?.map((item, index) => <Trains key={index} item={item} />)
                        }
                    </div>
                    <div className='sub-card'>
                        {lowestPriceModeReturn === 'train' &&
                            itineraryData?.itinerary.return_transportation?.map((item, index) => <TrainsReturn key={index} item={item} />)
                        }
                    </div>
                </div>
            </div>
            <hr />
            <h1 className='all-sub-head'>Estimated Cost (INR)</h1>
            <p>Transportation: {totalTransportationCost}</p>
            <p>Hotel: {totalHotelCost}</p>
            <p>Food: {totalFoodCost}</p>
            <p>Total Cost: {totalCost}</p>
            <hr />
            <div className="link-button1">
                <a href="/">Generate Again</a> <span />
                <button onClick={downloadPDF} className='download'>Download Itinerary (PDF)</button>
            </div>
        </div>
    );
}

export default ConfirmedItinerary;
