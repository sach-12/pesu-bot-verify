import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'


export default function Home() {
    const [init, setInit] = useState('Initializing...')
    const [userToken, setUserToken] = useState('')
    const [proceed, setProceed] = useState(false)
    const [prn, setPrn] = useState('')
    const [prnError, setPrnError] = useState(null)

    useEffect(() => {
        // Backend initialization
        axios.get('/api/init')
        .then(res => {
            setInit('Verifying authentication...')
            // Get "code" from discord redirected URL
            const code = new URLSearchParams(window.location.search).get('code')
            if (code) {
                axios.post('/api/get-user-access-token', {
                    code: code
                })
                .then(res => {
                    setInit('Checking you out in the server...')
                    setUserToken(res.data.userToken) // This user token will be used for all future requests
                    axios.post('/api/role-already-exists', {
                        userToken: res.data.userToken
                    })
                    .then(res => {
                        if(res.status === 200) {
                            setInit('Initialization complete')
                            setProceed(true)
                        }
                        else {
                            setInit(`Error: ${res.data.message}`)
                        }
                    })
                    .catch(err => {
                        console.log(err.response)
                        if(err.response.status === 401 || err.response.status === 403 || err.response.status === 405) {
                            setInit(`Error: ${err.response.data.message}`)
                        }
                        else {
                            setInit('Error: Server initialization failed')
                        }
                    })
                })
                .catch(err => {
                    console.log(err.response)
                    if(err.response.status === 401 || err.response.status === 405) {
                        setInit(`Error: ${err.response.data.message}`)
                    }
                    else {
                        setInit('Error: Server initialization failed')
                    }
                })
            }
            else {
                setInit('Error: Authentication failed')
            }
        })
        .catch(err => {
            console.log(err.response)
            if(err.response.status === 405) {
                setInit('Error: Method not allowed')
            }
            else{
                setInit('Error: Server initialization failed')
            }
        })
    }, [])

    const handlePRNSubmit = () => {
        console.log(prn)
    }


    return (
        <div>
            <Head>
                <title>PESU Discord</title>
                <meta name="description" content="PESU Discord Bot Validation" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar />

            {!proceed ? (
                <div className='not-ready max-w-xl mx-auto rounded-sm p-1 text-xl bg-pesu-light-brown text-center'>
                    <div className="loading-screen my-4">
                        <div className="loading-screen-content">
                            <div className="loading-screen-content-text">
                                <h1>{init}</h1>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="login-form max-w-lg mx-auto rounded-md p-4 text-xl bg-pesu-light-brown text-center">
                        <div className="login-form-content">
                            <div className="login-form-content-text">
                                <h1 className='my-4 text-2xl'>Please enter your PRN</h1>
                                <input type="text" placeholder="PES12019xxxxx" onChange={(e) => setPrn(e.target.value)} className='max-w-sm mx-auto my-4 outline-0 p-3 rounded-md focus-within:bg-slate-100 transition duration-200 ease-in-out tracking-widest' />
                                <button type="submit" value="Submit" onClick={(e) => handlePRNSubmit()} className='p-3 border-4 border-pesu-gray bg-opacity-40 bg-slate-200 border-opacity-50 max-w-sm mx-auto w-48 shadow-lg rounded-md font-bold tracking-wide text-xl hover:bg-pesu-dark-gray hover:bg-opacity-50 transition duration-500 ease-in-out'>
                                    Proceed
                                </button>
                                {prnError ? (
                                    <div className='my-4 text-xl text-center'>
                                        <p className='text-red-500'>{prnError}</p>
                                    </div>
                                ) : (
                                    <div className='my-4 text-xl text-center'>
                                        <p className='text-red-500'>{prnError}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
