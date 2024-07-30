import React, { useState, useEffect } from 'react';
import '../index.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FlightDashboard() {
    const [flights, setFlights] = useState({});
    const [updatedFlights, setUpdatedFlights] = useState({});
    const [filter, setFilter] = useState('all');

    const formatTime = (time) => {
        const date = new Date(time);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    function registerForNotification(flight_id) {
        // this feature is for testing
        fetch('http://localhost:8000/register-notification', {
            method: 'POST',
            body: JSON.stringify({
                email: "toshibhagat6@gmail.com",
                number: '+916202932643',
                flight_id: flight_id
            })
        })
            .then(success => {
                console.log("you have successfully subscribed!");
                toast.success('You have successfully subscribed!');
            })
            .catch(err => {
                console.log("err: ", err);
                toast.error("Something went wrong!")
            })
    }

    function syncUpdatedFlightsAndCurrentFlights() {
        const dataObj = { ...flights };
        Object.keys(updatedFlights).map(item => {
            dataObj[item]['status'] = updatedFlights[item]['new_status'];
        })
        console.log("data objects : ", dataObj)
        setFlights(dataObj);
    }

    useEffect(() => {
        // Fetch all flights on mount
        fetch('http://localhost:8000/flights')
            .then(response => response.json())
            .then(data => {
                const dataObj = {};
                data.map(item => {
                    dataObj[item.flight_id] = item;
                })
                setFlights(dataObj)
            });

        // Establish WebSocket connection
        const socket = new WebSocket('ws://localhost:8080');

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const dataObj = {};
            dataObj[data.flight_id] = data

            setUpdatedFlights(dataObj);

        };

        return () => {
            socket.close();
        };
    }, []);

    useEffect(() => {
        console.log("updated flights :", updatedFlights);
        syncUpdatedFlightsAndCurrentFlights();
    }, [updatedFlights])

    useEffect(() => {
        console.log("flights : ", flights)
    }, [flights])

    const updateFlightStatus = (flight) => {
        return (
            <div className={`w-[100%] min-w-[400px] max-w-[600px] flex flex-col justify-start`}>
                <div className='w-full flex flex-row justify-start'>
                    <div className='w-fit h-fit bg-indigo-700 py-3 px-2 rounded-t-[5px]'>
                        <img alt="indigo-logo" src="https://www.goindigo.in/content/dam/indigov2/sme/icIndigoLogoWhiteR-new.svg" />
                    </div>
                </div>
                <div className='w-full flex flex-row justify-between items-center border-[0.5px] border-gray-300 py-2 px-1'>
                    <h2 className='uppercase text-indigo-600 font-bold'>Flight No</h2>
                    <p className='tracking-wide text-lg font-bold'>{flight.flight_id}</p>
                </div>
                <div className='w-full flex flex-row justify-between items-center border-[0.5px] border-gray-300 py-2 px-1'>
                    <h2 className='uppercase text-indigo-600 font-bold'>Airline</h2>
                    <p className='tracking-wide text-lg'>{flight.airline}</p>
                </div>
                <div className='w-full flex flex-row justify-between items-center border-[0.5px] border-gray-300 py-2 px-1'>
                    <h2 className='uppercase text-indigo-600 font-bold'>Arriving On</h2>
                    <p className='tracking-wide text-lg'>{flight.arrival_gate}</p>
                </div>
                <div className='w-full flex flex-row justify-between items-center border-[0.5px] border-gray-300 py-2 px-1'>
                    <h2 className='uppercase text-indigo-600 font-bold'>Departing From</h2>
                    <p className='tracking-wide text-lg'>{flight.departure_gate}</p>
                </div>
                <div className='w-full flex flex-row justify-between items-center border-[0.5px] border-gray-300 py-2 px-1'>
                    <h2 className='uppercase text-indigo-600 font-bold'>Arrival Time</h2>
                    <p className='tracking-wide text-lg'>{new Date(flight.scheduled_arrival).toLocaleTimeString()}</p>
                </div>
                <div className='w-full flex flex-row justify-between items-center border-[0.5px] border-gray-300 py-2 px-1'>
                    <h2 className='uppercase text-indigo-600 font-bold'>Departure Time</h2>
                    <p className='tracking-wide text-lg'>{new Date(flight.scheduled_departure).toLocaleTimeString()}</p>
                </div>
                <div className='w-full flex flex-row justify-between items-center border-[0.5px] border-gray-300 py-2 px-1'>
                    <h2 className='uppercase text-indigo-600 font-bold'>Status</h2>
                    <p className='tracking-wide text-lg'>{flight.status}</p>
                </div>
                <div className='bg-indigo-700 text-white w-full text-center px-3 py-2 rounded-b-md self-center' onClick={() => {
                    registerForNotification(flight.flight_id)
                }}>
                    Notify Me
                </div>
            </div>
        );
    };

    const handleFilterChange = (filter) => {
        setFilter(filter);
    };

    return (
        <div className="w-full">
            <div className="fixed top-0 ">
                <ToastContainer
                    position="top-center"
                    autoClose={1000}
                    hideProgressBar={true}
                    newestOnTop={false}
                    closeButton={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
            </div>
            <div className='bg-indigo-700 py-3 px-2'>
                <img alt="indigo-logo" src="https://www.goindigo.in/content/dam/indigov2/sme/icIndigoLogoWhiteR-new.svg" />
            </div>
            <div className="container gap-9 my-4">
                {flights && Object.values(flights)
                    .map((flight) => (
                        <div key={flight?.flight_id}>
                            {updateFlightStatus(flight)}
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default FlightDashboard;