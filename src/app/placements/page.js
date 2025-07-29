"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactLoading from "react-loading";
import { CONSTANTS } from "@/utils/config";

const Placement = () => {
  const router = useRouter();
  const availableYears = Object.keys(CONSTANTS.PLACEMENTS);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (router === undefined) return;
    setLoading(false);
  }, [router]);

  return (
    <div>
      <Head>
        <title>Placements | PESU Discord</title>
      </Head>

      {loading ? (
        <div className="flex flex-col items-center h-[85vh] my-auto justify-center">
          <ReactLoading
            type="bubbles"
            color="#808183"
            height={100}
            width={100}
          />
          <h1 className="text-4xl text-pesu-c2">Loading</h1>
        </div>
      ) : (
        <div className="flex flex-col items-center h-[85vh] my-auto justify-center">
          <div className="flex flex-col justify-center items-center border bg-pesu-c0 gap-4 rounded-lg border-white/15 p-8">
            <h1 className="text-4xl text-white">Placements Data</h1>
            <div className="flex flex-row justify-center space-x-4">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => router.push(`/placements/${year}`)}
                  className="whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-pesu-c2 bg-pesu-c1 shadow-sm hover:bg-white hover:text-pesu-c0 h-9 px-4 py-2"
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Placement;
