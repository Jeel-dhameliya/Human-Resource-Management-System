export default function LeaveBalance(){

    return(

        <div className="grid grid-cols-2 gap-8 p-8 border-b">

            <div className="rounded-xl border p-6 bg-blue-50">

                <h3 className="text-blue-600 font-semibold">
                    Paid Time Off
                </h3>

                <p className="text-4xl mt-3 font-bold">
                    24
                </p>

                <p className="text-slate-500 mt-1">
                    Days Available
                </p>

            </div>

            <div className="rounded-xl border p-6 bg-green-50">

                <h3 className="text-green-600 font-semibold">
                    Sick Leave
                </h3>

                <p className="text-4xl mt-3 font-bold">
                    7
                </p>

                <p className="text-slate-500 mt-1">
                    Days Available
                </p>

            </div>

        </div>

    )

}