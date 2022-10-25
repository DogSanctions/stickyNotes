import { store } from '../../app/store'
import { notesApiSlice } from '../notes/notesApiSlice'
import { usersApiSlice } from '../users/usersApiSlice'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom' 

import React from 'react'

const Prefetch = () => {
    useEffect(() => {
        console.log('subscribing')
        const notes = store.dispatch(notesApiSlice.endpoints.getNotes.initiate()) // Subscribes to the protected page, so it doesn't refresh while the user is looking at the page.
        const users = store.dispatch(usersApiSlice.endpoints.getUsers.initiate()) // Subscribes to the protected page, so it doesn't refresh while the user is looking at the page.

        return () => {
            console.log('unsubscribing') // Unsubscribes when leaving the protected pages. Returns outlet, so protected pages need to be wrapped in prefetch component.
            notes.unsubscribe()
            users.unsubscribe()
        }
    }, []) // Empty dependcy array, so it runs only when the component mounts. When the component mounts it will log subscribing.
           

    return <Outlet />
}

export default Prefetch