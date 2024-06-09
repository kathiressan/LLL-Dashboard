"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { FilterService, FilterMatchMode } from 'primereact/api';

// Register the custom filter service
const assigneeRowFilterFunction = (assignees, filterValue) => {
  if (!filterValue || !assignees) return true;
  if (filterValue.length === 0) return true;
  else if (filterValue.length !== 0 && assignees.length === 0) return false;
  return filterValue.every((filterAssignee) => assignees.some(assignee => assignee.username === filterAssignee));
};
FilterService.register('customAssigneeFilter', assigneeRowFilterFunction);

const baseFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  "status.status": { value: null, matchMode: FilterMatchMode.IN },
  "assignees.username": { value: null, matchMode: 'customAssigneeFilter' },
  "watchers.username": { value: null, matchMode: FilterMatchMode.IN },
};

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState();
  const user_ls = JSON.parse(localStorage.getItem('user'));
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [filters, setFilters] = useState(baseFilters);
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  useEffect(() => {
    if (!user_ls || !tasks || tasks.length === 0) {
      router.replace("/");
    } else {
      setUser(user_ls);
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, globalFilterValue]);

  const applyFilters = () => {
    let filtered = tasks;

    // Global filter
    if (globalFilterValue) {
      filtered = filtered.filter(task =>
        task.name.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
        task.status.status.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
        task.assignees.some(assignee => assignee.username.toLowerCase().includes(globalFilterValue.toLowerCase())) ||
        task.watchers.some(watcher => watcher.username.toLowerCase().includes(globalFilterValue.toLowerCase())) ||
        task.creator.username.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
        (task.priority && task.priority.priority.toLowerCase().includes(globalFilterValue.toLowerCase()))
      );
    }

    // Status filter
    if (filters['status.status'].value && filters['status.status'].value.length > 0) {
      filtered = filtered.filter(task => filters['status.status'].value.includes(task.status.status));
    }

    // Assignees filter
    if (filters['assignees.username'].value && filters['assignees.username'].value.length > 0) {
      filtered = filtered.filter(task =>
        task.assignees.some(assignee => filters['assignees.username'].value.includes(assignee.username))
      );
    }

    setFilteredTasks(filtered);
  };

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const onStatusFilterChange = (e) => {
    const value = e.value;
    setFilters(prevFilters => ({
      ...prevFilters,
      "status.status": { ...prevFilters['status.status'], value }
    }));
  };

  const onAssigneeFilterChange = (e) => {
    const value = e.value;
    setFilters(prevFilters => ({
      ...prevFilters,
      "assignees.username": { ...prevFilters['assignees.username'], value }
    }));
  };

  const assigneeOptions = Array.from(new Set(tasks.flatMap(task => task.assignees?.map(assignee => assignee.username)))).filter(Boolean).map(username => ({ label: username, value: username }));
  const statusOptions = Array.from(new Set(tasks.map(task => task.status?.status))).filter(Boolean);

  const rowClassName = () => {
    return 'hover-row';
  };

  const handleRowClick = (task) => {
    const link = task.url;
    window.open(link, '_blank');
  };

  const statusBodyTemplate = (rowData) => {
    const statusStyle = {
      backgroundColor: rowData.status.color,
      color: 'white',
      textTransform: 'uppercase',
      padding: '5px',
      borderRadius: '4px',
      display: 'inline-block',
      fontSize: "12px",
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
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
    );
  };

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
    const options = { day: '2-digit', month: 'short', year: '2-digit' };
    return date.toLocaleDateString('en-GB', options);
  }

  const dueDateBodyTemplate = (rowData) => {
    if (rowData?.due_date) {
      return (
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {formatDate(rowData?.due_date)}
        </div>
      );
    } else {
      return <></>;
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between">
        <Button type="button" icon="pi pi-filter-slash" label="Clear" onClick={() => { setFilters(baseFilters); setGlobalFilterValue(''); }} />
        <span className="p-input-icon-left flex items-center">
          <i className="pi pi-search ml-2" />
          <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Global Search" className='pl-8' />
        </span>
      </div>
    );
  };

  const header = renderHeader();

  return (
    <div className='max-w-7xl m-auto p-3'>
      <div className='text-2xl text-center mt-10 text-orange-600'>
        Hi, {user?.username}. Welcome to LLL ClickUp Dashboard.
      </div>

      <div className='cursor-pointer hover:opacity-75 flex items-center w-[150px]'>
        <i className="pi pi-sync" style={{ fontSize: '1rem' }}></i>
        <span className='ml-2' onClick={() => { router.push("/redirect"); }}>Refresh Data</span>
      </div>

      <div className='cursor-pointer hover:opacity-75 flex items-center w-[150px]'>
        <i className="pi pi-user-edit" style={{ fontSize: '1rem' }}></i>
        <a className="ml-2" href={`https://app.clickup.com/api?client_id=${process.env.NEXT_PUBLIC_CLICKUP_CLIENT_ID}&redirect_uri=https://lll-dashboard-i3uc.vercel.app/`}>Change Team</a>
      </div>

      <div className="table-wrapper mt-5 mb-5">
        <DataTable value={filteredTasks} rowClassName={rowClassName} onRowClick={(e) => handleRowClick(e.data)} paginator rows={10} header={header} filterDisplay="menu">
          <Column field="name" header="Tasks" />
          <Column field="status.status" header="Status" body={statusBodyTemplate} filter showFilterMatchModes={false} showAddButton={false} showFilterOperator={false} filterElement={
            <MultiSelect 
              value={filters['status.status'].value} 
              options={statusOptions.map(option => ({ label: option, value: option }))}
              onChange={onStatusFilterChange}
              optionLabel="label"
              placeholder="Select Status" 
              className="p-column-filter"
              showClear 
            />
          } />
          <Column field="assignees" header="Assignees" body={assigneesBodyTemplate} showFilterMatchModes={false} showAddButton={false} showFilterOperator={false} filter filterField="assignees.username" filterMatchMode="customAssigneeFilter" filterElement={
            <MultiSelect 
              value={filters['assignees.username'].value} 
              options={assigneeOptions}
              onChange={onAssigneeFilterChange}
              optionLabel="label"
              placeholder="Select Assignees" 
              className="p-column-filter"
              showClear 
            />
          } />
          <Column field="watchers" header="Watchers" body={watchersBodyTemplate} />
          <Column field="creator" header="Creator" body={creatorBodyTemplate} />
          <Column field="priority" header="Priority" body={priorityBodyTemplate} />
          <Column field="due_date" header="Due Date" body={dueDateBodyTemplate} />
        </DataTable>
      </div>
    </div>
  );
}
