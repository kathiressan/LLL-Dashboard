"use client"

import Image from "next/image";
import { Button } from 'primereact/button';
import axios from "axios";

export default function Home() {

  async function handleRedirect() {
    await axios.get(`https://app.clickup.com/api?client_id=${process.env.NEXT_PUBLIC_CLICKUP_CLIENT_ID}&redirect_uri=https://lll-dashboard-i3uc.vercel.app/`)
  }

  return (
    <main className="flex max-h-screen flex-col items-center justify-between p-24 mt-24">
      <div className="surface-0 text-700 text-center">
          <Image
              src="/lll_logo.png"
              alt="Vercel Logo"
              className="m-auto"
              width={100}
              height={24}
              priority
            />


          <div className="text-900 font-bold text-5xl mb-3 text-orange-400">Life Line Lab</div>
          <div  className="text-500 font-bold text-3xl mb-3 text-orange-400">Click Up Dashboard</div>

          <div className="text-blue-600 font-bold mb-3 mt-6"><i className="pi pi-discord"></i>&nbsp;By Kathiressan Sivanes</div>

          <Button label="Sign In Via ClickUp" icon="pi pi-discord" className="bg-gradient-to-r from-pink-500 to-blue-500 font-bold px-5 py-3 p-button-raised p-button-rounded white-space-nowrap text-white rounded-xl hover:opacity-85" onClick={() => {handleRedirect()}} />
      </div>
    </main>
  );
}
