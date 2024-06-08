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

  const updateData = useRef(false);

  const [localAuthToken, setLocalAuthToken] = useState(() => localStorage.getItem("authToken"));

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code && !localAuthToken) {
      router.replace('/');
      return;
    } else if (code) {
      localStorage.removeItem("authToken");
      setLocalAuthToken(null);
    }

    async function fetchData() {
      try {
        const res = await fetch('/api/get-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const result = await res.json();
        if (res.ok) {
          setData(result);
        } else {
          // router.replace('/');
        }
      } catch (err) {
        setError(err.message);
      }
    }

    if (code) fetchData();
  }, [searchParams]);

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
        // setTeams(result?.teams);
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
    // Get Teams    
    const teamsRes = await fetchTeamsData(auth_token);
    const foundTeams = get(teamsRes, "teams", []);
    localStorage.setItem("teams", JSON.stringify(foundTeams));

    for (const teamObj of foundTeams) {
      const teamID = teamObj.id;
      const teamName = teamObj.name;

      // Get Spaces
      const spacesRes = await fetchSpacesData(auth_token, teamID);
      const foundSpaces = get(spacesRes, "spaces", []);
      localStorage.setItem("spaces", JSON.stringify(foundSpaces));

      for (const spaceObj of foundSpaces) {
        const spaceID = spaceObj.id;
        const spaceName = spaceObj.name;

        // Get Folders
        const foldersRes = await fetchFoldersData(auth_token, spaceID);
        const foundFolders = get(foldersRes, "folders", []);
        localStorage.setItem("folders", JSON.stringify(foundFolders));

        for (const folderObj of foundFolders) {
          const folderID = folderObj.id;
          const folderName = folderObj.name;
          const folderLists = get(folderObj, "lists", []);
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
      localStorage.setItem("tasks", JSON.stringify(tasks));
      setLoading(false);
      router.replace("/home");
    }
  }

  useEffect(() => {
    async function process() {
      if (authToken || localAuthToken) {
        if (authToken) {
          localStorage.setItem("authToken", authToken);
          localStorage.setItem("timestamp", new Date().toISOString()); 
        } else {
          setAuthToken(localAuthToken);
        }
        updateData.current = true;
        await fetchUserData(authToken || localAuthToken);
        await fetchAllData(authToken || localAuthToken);
      }
    }
    if (updateData.current == false) {
      process();
    }
  }, [authToken, localAuthToken]);

  useEffect(() => {
    if (data && authToken !== data.access_token) {
      setAuthToken(data.access_token);
    }
  }, [data]);

  if (loading) {
    return (
      <div className='mt-36'>
        <Loader type="spinner-circle" bgColor={"orange"} size={250} />
      </div>
    );
  }

  return null;
}
