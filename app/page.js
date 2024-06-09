"use client"

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { Button } from 'primereact/button';
import axios from "axios";
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog } from 'primereact/dialog';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const footerContent = (
    <div>
        <Button label="No" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
        <Button label="Yes" icon="pi pi-check" style={{marginLeft: "5px"}} onClick={() => {setVisible(false); router.push("/home");}} autoFocus />
    </div>
  );

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) router.push(`/redirect?code=${code}`);

    const timestamp = localStorage.getItem('timestamp');
    const authToken = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    if (timestamp) {
      const storedDate = new Date(timestamp); // Parse the stored timestamp
      const currentDate = new Date(); // Get the current date and time
    
      const differenceInMilliseconds = currentDate - storedDate; // Calculate the difference in milliseconds
      const differenceInMinutes = differenceInMilliseconds / 1000 / 60; // Convert milliseconds to minutes
      // Check if the difference is greater than 10 minutes
      if (differenceInMinutes < 10 && user && tasks && tasks.length > 0 && authToken && !code) {
        setVisible("true");
      } else {
        localStorage.removeItem('timestamp');
        localStorage.removeItem('user');
        localStorage.removeItem('tasks');
      }
    }
  }, [])

  return (
    <main className="flex max-h-screen flex-col items-center justify-between p-24 mt-10">
      <Dialog draggable={false} header="Confirm Login" visible={visible} position="center" style={{ width: '50vw' }} onHide={() => {if (!visible) return; setVisible(false); }} footer={footerContent}>
          <p className="m-0">
            You have logged in previously. Continue previous session?
          </p>
      </Dialog>
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
          <div  className="text-500 font-bold text-3xl mb-3 text-orange-400 mb-10">Click Up Dashboard</div>

          <div className="text-blue-600 font-bold mt-6 mb-6 flex items-center justify-center">
            {/* <i className="pi pi-heart-fill"></i>  */}
            <span className='ml-2'>By Kathiressan Sivanes</span> 
          </div>

          <a className="bg-gradient-to-r from-pink-500 to-blue-500 font-bold px-5 py-3 p-button-raised p-button-rounded white-space-nowrap text-white rounded-xl hover:opacity-85" href={`https://app.clickup.com/api?client_id=${process.env.NEXT_PUBLIC_CLICKUP_CLIENT_ID}&redirect_uri=https://lll-dashboard-i3uc.vercel.app/`}>Sign In Via ClickUp</a>
      </div>
    </main>
  );
}
