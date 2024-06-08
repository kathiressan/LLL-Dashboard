'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from "../store";
import Loader from "react-js-loader";
import { isEmpty } from 'lodash';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PrimeIcons } from 'primereact/api';

export default function Page() {
  const router = useRouter();
  const { authToken } = useStore();
  const [user, setUser] = useState();
  const user_ls = JSON.parse(localStorage.getItem('user'));
  const tasks = JSON.parse(localStorage.getItem('tasks'));

  useEffect(() => {    
    if (!user_ls || !tasks || tasks.length === 0) {
      router.replace("/");
    } else {
      setUser(user_ls)
    }

  }, [])

  const rowClassName = () => {
    return 'hover-row';
  };

  const handleRowClick = (task) => {
    // Define your link here
    const link = task.url;
    window.open(link, '_blank'); // Open the link in a new tab
  };

  const statusBodyTemplate = (rowData) => {
    const statusStyle = {
      backgroundColor: rowData.status.color, // Set background color from the task
      color: 'white', // Set text color to white
      textTransform: 'uppercase', // Convert text to uppercase
      // fontWeight: 'bold', // Make text bold
      padding: '5px', // Add some padding for better appearance
      borderRadius: '4px', // Add some border radius for rounded corners
      display: 'inline-block', // Inline block to ensure proper padding and background application
      fontSize: "12px",
      whiteSpace: 'nowrap', // Prevent text from wrapping
      overflow: 'hidden', // Hide overflow
      textOverflow: 'ellipsis', // Add ellipsis for overflowing text
    };

    return (
      <div style={statusStyle}>
        {rowData.status.status}
      </div>
    );
  };

  const assigneesBodyTemplate = (rowData) => {
    return (
      <div>
        {rowData.assignees.map((assignee, index) => (
          <span key={index} className="inline-block mr-2" style={{ color: assignee.color }}>
            {assignee.username}
          </span>
        ))}
      </div>
    );
  };

  const watchersBodyTemplate = (rowData) => {
    return (
      <div>
      {rowData.watchers.map((watcher, index) => (
        <span key={index} className="inline-block mr-2" style={{ color: watcher.color }}>
          {watcher.username}
        </span>
      ))}
    </div>
    )
  }

  const creatorBodyTemplate = (rowData) => {
    return (
      <div style={{ color: rowData.creator.color }}>
        {rowData.creator.username}
      </div>
    );
  };

  const priorityBodyTemplate = (rowData) => {
    return (
      <div style={{ color: rowData?.priority?.color, textTransform: 'uppercase' }}>
        {rowData?.priority?.priority}
      </div>
    );
  };

  function formatDate(timestamp) {
    const date = new Date(parseInt(timestamp));
    const options = { day: '2-digit', month: 'short', year: '2-digit' }; // Customize the date format options
    return date.toLocaleDateString('en-GB', options); // 'en-GB' for day-month-year format
  }

  const dueDateBodyTemplate = (rowData) => {
    if (rowData?.due_date) {
      return (
        <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {formatDate(rowData?.due_date)}
        </div>
      )
    } else {
      return <></>
    }
  }

  return (
    <div className='max-w-7xl m-auto p-3'>
      <div className='text-2xl text-center mt-10 text-orange-600'>
        Hi, {user?.username}. Welcome to LLL ClickUp Dashboard.
      </div>

      <div className='cursor-pointer hover:opacity-75 flex items-center w-[150px]'>
        <i className="pi pi-sync" style={{ fontSize: '1rem' }}></i>
        <span className='ml-2' onClick={() => {router.push("/redirect");}}>Refresh Data</span>   
      </div>

      <div className='cursor-pointer hover:opacity-75 flex items-center w-[150px]'>
        <i className="pi pi-user-edit" style={{ fontSize: '1rem' }}></i>
        <a className="ml-2" href={`https://app.clickup.com/api?client_id=${process.env.NEXT_PUBLIC_CLICKUP_CLIENT_ID}&redirect_uri=https://lll-dashboard-i3uc.vercel.app/`}>Change Team</a>
      </div>

      <div className="table-wrapper mt-5 mb-5">
        <DataTable value={tasks} color='#FFA500' rowClassName={rowClassName} onRowClick={(e) => handleRowClick(e.data)}>
          <Column field="name" header="Tasks"></Column>
          <Column field="status.status" header="Status" body={statusBodyTemplate}></Column>
          <Column field="assignees" header="Assignees" body={assigneesBodyTemplate}></Column>
          <Column field="watchers" header="Watchers" body={watchersBodyTemplate}></Column>
          <Column field="creator" header="Creator" body={creatorBodyTemplate}></Column>
          <Column field="priority" header="Priority" body={priorityBodyTemplate}></Column>
          <Column field="due_date" header="Due Date" body={dueDateBodyTemplate}></Column>
        </DataTable>
      </div>
    </div>
  )
}
