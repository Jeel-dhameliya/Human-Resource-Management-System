import { useState } from "react";
import Navbar from "../components/Navbar";
import TimeOffHeader from "../components/TimeOffHeader";
import LeaveBalance from "../components/LeaveBalance";
import LeaveTable from "../components/LeaveTable";
import CalendarView from "../components/CalendarView";
import LeaveModal from "../components/LeaveModal";

export default function TimeOff() {
    const [showModal,setShowModal]=useState(false);
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    const role = user?.role || 'employee';

    return(
        <>
            <Navbar/>

            <div className="bg-slate-100 min-h-screen p-8">

                <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">

                    <TimeOffHeader
                        openModal={()=>setShowModal(true)}
                    />

                    <LeaveBalance/>

                    {
                        role==="admin"
                        ?
                        <LeaveTable/>
                        :
                        <CalendarView
                            openModal={()=>setShowModal(true)}
                        />
                    }

                </div>

            </div>

            {
                showModal &&
                <LeaveModal
                    close={()=>setShowModal(false)}
                />
            }

        </>
    )

}