import { useState } from "react";
import { Search } from "lucide-react";

export default function TimeOffHeader({openModal}){

    const [search,setSearch]=useState("");

    return(

        <>

        <div className="border-b px-8 py-5">

            <h1 className="text-3xl font-semibold text-slate-700">
                Time Off
            </h1>

        </div>

        <div className="flex justify-between items-center px-8 py-5 border-b">

            <div className="flex gap-4">

                <button className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700">
                    Time Off
                </button>

                <button className="border border-slate-300 px-5 py-2 rounded-lg hover:bg-slate-100">
                    Allocation
                </button>

            </div>

            <div className="flex gap-4">

                <div className="relative">

                    <Search
                        size={18}
                        className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                        value={search}
                        onChange={(e)=>setSearch(e.target.value)}
                        placeholder="Search Employee"
                        className="pl-10 w-72 border rounded-lg py-2 outline-none focus:border-purple-500"
                    />

                </div>

                <button
                onClick={openModal}
                className="bg-purple-600 text-white px-6 rounded-lg hover:bg-purple-700">

                    + New

                </button>

            </div>

        </div>

        </>

    )

}