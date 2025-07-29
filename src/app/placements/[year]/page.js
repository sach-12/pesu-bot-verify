"use client";

import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactLoading from "react-loading";
import { CONSTANTS } from "@/utils/config";

const Placement = ({ params }) => {
  const router = useRouter();
  const data = CONSTANTS.PLACEMENTS;

  useEffect(() => {
    if (router === undefined) return;

    if (params.year && data[params.year]) {
      window.location.replace(data[params.year]);
    } else {
      router.push("/placements");
    }
  }, [router]);

  return (
    <div>
      <Head>
        <title>Placements | PESU Discord</title>
      </Head>

      <div className="flex flex-col items-center h-[85vh] my-auto justify-center">
        <ReactLoading type="bubbles" color="#808183" height={100} width={100} />
        <h1 className="text-4xl text-pesu-c2">Loading</h1>
      </div>
    </div>
  );
};

export default Placement;
