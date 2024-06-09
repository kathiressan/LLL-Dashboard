'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Loader from "react-js-loader";
import useStore from '../store';
import { get } from "lodash";

export default function RedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authToken, setAuthToken } = useStore();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [processMessage, setProcessMessage] = useState("");

  const updateData = useRef(false);

  const [localAuthToken, setLocalAuthToken] = useState(() => localStorage.getItem("authToken"));

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code && !localAuthToken) {
      router.replace('/');
      return;
    } else if (!code && localAuthToken) {
      setAuthToken(localAuthToken)
    }

    async function fetchData() {
      try {
        setProcessMessage("Fetching user data...");
        const res = await fetch('/api/get-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const result = await res.json();
        if (res.ok) {
          localStorage.removeItem("authToken");
          setLocalAuthToken(null);
          setData(result);
        } else {
          if (localAuthToken) setAuthToken(localAuthToken);
          else router.replace('/');
        }
      } catch (err) {
        setError(err.message);
      }
    }

    if (code) fetchData();
  }, []);

  async function fetchUserData(auth_token) {
    try {
      const res = await fetch('/api/get-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authToken: auth_token }),
      });

      const result = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(result?.user));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  async function fetchTeamsData(authToken) {
    try {
      const res = await fetch('/api/get-teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authToken }),
      });

      const result = await res.json();
      if (res.ok) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchSpacesData(authToken, teamID) {
    try {
      const res = await fetch('/api/get-spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authToken, teamID }),
      });

      const result = await res.json();
      if (res.ok) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchFoldersData(authToken, spaceID) {
    try {
      const res = await fetch('/api/get-folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authToken, spaceID }),
      });

      const result = await res.json();
      if (res.ok) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchFolderlessListData(authToken, spaceID) {
    try {
      const res = await fetch('/api/get-folderless-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authToken, spaceID }),
      });

      const result = await res.json();
      if (res.ok) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchTasksData(authToken, listID, page) {
    try {
      const res = await fetch('/api/get-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authToken, listID, page }),
      });

      const result = await res.json();
      if (res.ok) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchAllData(auth_token) {
    let lists = [];
    let tasks = [];

    setProcessMessage("Fetching teams data...");
    // Get Teams    
    const teamsRes = await fetchTeamsData(auth_token);
    const foundTeams = get(teamsRes, "teams", []);
    localStorage.setItem("teams", JSON.stringify(foundTeams));

    for (const teamObj of foundTeams) {
      const teamID = teamObj.id;
      const teamName = teamObj.name;

      setProcessMessage("Fetching spaces data...");
      // Get Spaces
      const spacesRes = await fetchSpacesData(auth_token, teamID);
      const foundSpaces = get(spacesRes, "spaces", []);
      localStorage.setItem("spaces", JSON.stringify(foundSpaces));

      for (const spaceObj of foundSpaces) {
        const spaceID = spaceObj.id;
        const spaceName = spaceObj.name;

        setProcessMessage("Fetching folders data...");
        // Get Folders
        const foldersRes = await fetchFoldersData(auth_token, spaceID);
        const foundFolders = get(foldersRes, "folders", []);
        localStorage.setItem("folders", JSON.stringify(foundFolders));

        for (const folderObj of foundFolders) {
          const folderID = folderObj.id;
          const folderName = folderObj.name;
          const folderLists = get(folderObj, "lists", []);
          setProcessMessage("Fetching folder lists data...");
          for (const listObj of folderLists) {
            const listID = listObj.id;
            const listName = listObj.name;
            lists.push({
              teamID,
              teamName,
              spaceID,
              spaceName,
              folderID,
              folderName,
              listID,
              listName,
            });
          }
        }

        // Get folderless lists
        const folderlessListRes = await fetchFolderlessListData(auth_token, spaceID);
        const foundFolderlessLists = get(folderlessListRes, "lists", []);
        setProcessMessage("Fetching folderless lists data...");
        for (const listObj of foundFolderlessLists) {
          const listID = listObj.id;
          const listName = listObj.name;
          const listFolderID = get(listObj, "folder.id");
          const listFolderName = get(listObj, "folder.name");
          lists.push({
            teamID,
            teamName,
            spaceID,
            spaceName,
            listFolderID,
            listFolderName,
            listID,
            listName,
          });
        }

      }
    }

    localStorage.setItem("lists", JSON.stringify(lists));

    setProcessMessage("Fetching tasks data. This may take a while...");
    // Fetch all tasks
    for (const listObj of lists) {
      const listID = listObj.listID;
      let page = 0;
      let isLastPage = false;
      while (isLastPage === false) {
        const tasksRes = await fetchTasksData(auth_token, listID, page);
        const foundTasks = get(tasksRes, "tasks", []);
        const lastPage = get(tasksRes, "last_page", true);
        for (const task of foundTasks) {
          const newTask = {
            ...task,
            ...listObj
          };
          tasks.push(newTask);
        }
        page += 1;
        if (lastPage === true) isLastPage = true;
      }
    }

    if (tasks.length > 0) {
      setProcessMessage("Saving tasks data...");
      localStorage.setItem("tasks", JSON.stringify(tasks));
      setLoading(false);
      router.replace("/home");
    }
  }

  useEffect(() => {
    async function process() {
      if (authToken) {
        console.log("auth token", authToken)
        localStorage.setItem("authToken", String(authToken));
        localStorage.setItem("timestamp", new Date().toISOString()); 
        updateData.current = true;
        await fetchUserData(authToken);
        await fetchAllData(authToken);
      }
    }
    if (updateData.current == false) {
      process();
    }
  }, [authToken]);

  useEffect(() => {
    if (data && authToken !== data.access_token) {
      setProcessMessage("Setting Auth Token...");
      setAuthToken(data.access_token);
    }
  }, [data]);

  if (loading) {
    return (
      <div>
        <div className='mt-36'>
          <Loader type="spinner-circle" bgColor={"orange"} size={250} />
        </div>
        <div className='text-center mt-16'>{processMessage}</div>
      </div>
    );
  }

  return null;
}
