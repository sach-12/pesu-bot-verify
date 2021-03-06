import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'


export default function Home({ ip }) {
    // Initial states
    const [init, setInit] = useState('Initializing...')
    const [userToken, setUserToken] = useState('')
    const [userIp, setUserIp] = useState('')

    const [proceed, setProceed] = useState(false) // Proceed to form
    const [prn, setPrn] = useState('') // User-entered PRN
    const [prnError, setPrnError] = useState(null) // Error message for PRN

    const [collectSrn, setCollectSrn] = useState(false) // Proceed to collect SRN
    const [srn, setSrn] = useState('') // User-entered SRN
    const [srnError, setSrnError] = useState(null) // Error message for SRN

    const [collectSection, setCollectSection] = useState(false) // Proceed to collect section
    const [section, setSection] = useState('') // User-entered section
    const [sectionError, setSectionError] = useState(null) // Error message for section

    const [succesful, setSuccessful] = useState(false) // Proceed to successful page on successful validation
    const [successSection, setSuccessSection] = useState('') // Server-provided section
    const [successBranch, setSuccessBranch] = useState('') // Server-provided branch

    useEffect(() => {
        // Backend initialization
        setUserIp(ip)
        const headers = {
            'x-real-ip': userIp,
        }
        axios.get('/api/init', { headers: headers })
        .then(res => {
            setInit('Verifying authentication...')
            // Get "code" from discord redirected URL
            const code = new URLSearchParams(window.location.search).get('code')
            if (code) {
                axios.post('/api/get-user-access-token', {
                    code: code
                }, { headers: headers })
                .then(res => {
                    setInit('Checking you out in the server...')
                    setUserToken(res.data.userToken) // This user token will be used for all future requests
                    axios.post('/api/role-already-exists', {
                        userToken: res.data.userToken
                    }, { headers: headers })
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
                        if((err.response.status >=400) && (err.response.status <500)) {
                            setInit(`Error: ${err.response.data.message}`)
                        }
                        else {
                            setInit('Error: Server initialization failed')
                        }
                    })
                })
                .catch(err => {
                    if((err.response.status >=400) && (err.response.status <500)) {
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
            if((err.response.status >=400) && (err.response.status <500)) {
                setInit(`Error: ${err.response.data.message}`)
            }
            else{
                setInit('Error: Server initialization failed')
            }
        })
    }, [])

    // Function to handle PRN submit event
    const handlePRNSubmit = () => {
        if(!prn) {
            setPrnError('PRN cannot be empty')
        }
        else {
            const headers = {
                'x-real-ip': userIp
            }
            // Check if PRN already in MongoDB
            axios.post('/api/already-validated-prn', {
                userToken: userToken,
                prn: prn.toUpperCase()
            }, { headers: headers })
            .then(res => {
                // Get server-provided SRN/Section based on year
                axios.post('/api/prn-exists', {
                    userToken: userToken,
                    prn: prn.toUpperCase()
                }, { headers: headers })
                .then(res => {
                    setPrnError(null)
                    // PES1201"8"00000: The 7th index decides the year
                    if(prn.charAt(7) === '8') {
                        setSrnError(null)
                        setCollectSection(true)
                    }
                    else {
                        setSectionError(null)
                        setCollectSrn(true)
                    }
                })
                .catch(err => {
                    if((err.response.status >=400) && (err.response.status <500)) {
                        setPrnError(`Error: ${err.response.data.message}`)
                    }
                    else {
                        setPrnError('Error: Internal Server Error')
                    }
                })
            })
            .catch(err => {
                if((err.response.status >=400) && (err.response.status <500)) {
                    setPrnError(`Error: ${err.response.data.message}`)
                }
                else {
                    setPrnError('Error: Internal Server Error')
                }
            })
        }
    }

    // Function to handle PRN edit button click event
    const handlePRNEdit = () => {
        setCollectSection(false);
        setCollectSrn(false);
        setSrnError(null);
        setSectionError(null);
    }

    // Function to handle SRN submit event
    const handleSRNSubmit = () => {
        if(!srn) {
            setSrnError('SRN cannot be empty')
        }
        else {
            const headers = {
                'x-real-ip': userIp
            }
            // Validate user, provide roles, update DB, etc.
            axios.post('/api/new-validate', {
                userToken: userToken,
                prn: prn.toUpperCase(),
                srn: srn.toUpperCase()
            }, { headers: headers })
            .then(res => {
                setSrnError(res.data.message)
                setSuccessSection(res.data.section)
                setSuccessBranch(res.data.branch)
                setSuccessful(true)
            })
            .catch(err => {
                if((err.response.status >=400) && (err.response.status <500)) {
                    setSrnError(`Error: ${err.response.data.message}`)
                }
                else {
                    setSrnError('Error: Internal Server Error')
                }
            })
        }
    }

    // Function to handle SRN edit button click event
    const handleSectionSubmit = () => {
        if(!section) {
            setSectionError('Section cannot be empty')
        }
        else {
            const headers = {
                'x-real-ip': userIp
            }
            // Validate user, provide roles, update DB, etc.
            axios.post('/api/new-validate', {
                userToken: userToken,
                prn: prn.toUpperCase(),
                section: section.toUpperCase()
            }, { headers: headers })
            .then(res => {
                setSuccessSection(res.data.section)
                setSuccessBranch(res.data.branch)
                setSuccessful(true)
            })
            .catch(err => {
                if((err.response.status >=400) && (err.response.status <500)) {
                    setSectionError(`Error: ${err.response.data.message}`)
                }
                else {
                    setSectionError('Error: Internal Server Error')
                }
            })
        }
    }

    const handleReport = (source) => {
        let errorType = '';
        let errorMessage = '';
        if(source === 'prn') {
            errorType = 'PRN';
            errorMessage = `${prnError}\nPRN: ${prn}`;
        }
        else if(source === 'srn') {
            errorType = 'SRN';
            errorMessage = `${srnError}\nPRN: ${prn}\nSRN: ${srn}`;
        }
        else if(source === 'section') {
            errorType = 'Section';
            errorMessage = `${sectionError}\nPRN: ${prn}\nSection: ${section}`;
        }

        const headers = {
            'x-real-ip': userIp
        }
        axios.post('/api/report-error', {
            userToken: userToken,
            errorType: errorType,
            errorMessage: errorMessage
        }, { headers: headers })
        .then(res => {
            const errorId = res.data.errorId;
            alert(`Your error has been reported. Error ID: ${errorId}.`)
        })
        .catch(err => {
            if((err.response.status >=400) && (err.response.status <500)) {
                alert(`Error: ${err.response.data.message}`)
            }
            else {
                alert('Error: Internal Server Error')
            }
        })
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
                    {!succesful ? (
                        <div className="validate-form">
                            <div className="login-form max-w-lg mx-auto rounded-md p-4 text-xl bg-pesu-light-brown text-center">
                                <h1 className='mt-4 mb-3 text-2xl font-extrabold'>Enter your PRN</h1>
                                {(!collectSection && !collectSrn) ? (
                                    <div className="collect-prn">
                                        <input type="text" placeholder="PES12019xxxxx" onChange={(e) => setPrn(e.target.value)} className='max-w-sm mx-auto my-4 outline-0 p-3 rounded-md focus-within:bg-slate-100 transition duration-200 ease-in-out tracking-widest' />
                                        <button type="submit" value="Submit" onClick={(e) => handlePRNSubmit()} className='p-3 border-4 border-pesu-gray bg-opacity-40 bg-slate-200 border-opacity-50 max-w-sm mx-auto w-48 shadow-lg rounded-md font-bold tracking-wide text-xl hover:bg-pesu-dark-gray hover:bg-opacity-50 transition duration-500 ease-in-out'>
                                            Proceed
                                        </button>
                                    </div>
                                ) : (
                                    <div className="prn-done flex">
                                        <input type="text" placeholder="PES12019xxxxx" value={prn} className='max-w-sm mx-auto my-4 outline-0 p-3 rounded-md focus-within:bg-slate-100 transition duration-200 ease-in-out tracking-widest' />
                                        <button type="submit" value="Submit" onClick={(e) => {handlePRNEdit()}} className='ml-2 mt-2 max-h-16 p-1 border-4 border-pesu-gray bg-opacity-40 bg-slate-200 border-opacity-50 max-w-sm mx-auto w-20 h-14 shadow-lg rounded-md font-bold tracking-wide text-xl hover:bg-pesu-dark-gray hover:bg-opacity-50 transition duration-500 ease-in-out'>
                                            Edit
                                        </button>
                                    </div>
                                )}

                                {prnError && (
                                    <div className='mt-4 text-center'>
                                        <p className='text-red-600 text-xl font-bold'>{prnError}</p>
                                        <div className="report mt-4">
                                            <p className='text-gray-900 text-xl tracking-tighter'>If you think this is an error, please click this button and we will get back to you soon.</p>
                                            <button type="submit" value="Submit" onClick={(e) => {handleReport('prn')}} className='p-3 border-4 border-pesu-gray bg-opacity-40 bg-slate-200 border-opacity-50 max-w-sm mx-auto w-48 shadow-lg rounded-md font-bold tracking-wide text-xl hover:bg-pesu-dark-gray hover:bg-opacity-50 transition duration-500 ease-in-out'>
                                                Report error
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {collectSrn && (
                                    <div className="collect-srn">
                                        <h1 className='mt-4 mb-3 text-2xl font-extrabold'>Enter your SRN</h1>
                                        <input type="text" placeholder="PES1UG19xxxxx" onChange={(e) => setSrn(e.target.value)} className='max-w-sm mx-auto my-4 outline-0 p-3 rounded-md focus-within:bg-slate-100 transition duration-200 ease-in-out tracking-widest' />
                                        <button type="submit" value="Submit" onClick={(e) => {handleSRNSubmit()}} className='p-3 border-4 border-pesu-gray bg-opacity-40 bg-slate-200 border-opacity-50 max-w-sm mx-auto w-48 shadow-lg rounded-md font-bold tracking-wide text-xl hover:bg-pesu-dark-gray hover:bg-opacity-50 transition duration-500 ease-in-out'>
                                            Validate
                                        </button>

                                        {srnError && (
                                            <div className="srn-error">
                                                <p className='text-red-600 text-xl font-bold'>{srnError}</p>
                                                <div className="report mt-4">
                                                    <p className='text-gray-900 text-xl tracking-tighter'>If you think this is an error, please click this button and we will get back to you soon.</p>
                                                    <button type="submit" value="Submit" onClick={(e) => {handleReport('srn')}} className='p-3 border-4 border-pesu-gray bg-opacity-40 bg-slate-200 border-opacity-50 max-w-sm mx-auto w-48 shadow-lg rounded-md font-bold tracking-wide text-xl hover:bg-pesu-dark-gray hover:bg-opacity-50 transition duration-500 ease-in-out'>
                                                        Report error
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {collectSection && (
                                    <div className="collect-section">
                                        <h1 className='my-4 text-2xl font-extrabold'>Enter your Section</h1>
                                        <input type="text" placeholder="X" onChange={(e) => setSection(e.target.value)} className='max-w-sm mx-auto my-4 outline-0 p-3 rounded-md focus-within:bg-slate-100 transition duration-200 ease-in-out tracking-widest' />
                                        <button type="submit" value="Submit" onClick={(e) => {handleSectionSubmit()}} className='p-3 border-4 border-pesu-gray bg-opacity-40 bg-slate-200 border-opacity-50 max-w-sm mx-auto w-48 shadow-lg rounded-md font-bold tracking-wide text-xl hover:bg-pesu-dark-gray hover:bg-opacity-50 transition duration-500 ease-in-out'>
                                            Validate
                                        </button>

                                        {sectionError && (
                                            <div className="section-error">
                                                <p className='text-red-600 text-xl font-bold'>{sectionError}</p>
                                                <div className="report mt-4">
                                                    <p className='text-gray-900 text-xl tracking-tighter'>If you think this is an error, please click this button and we will get back to you soon.</p>
                                                    <button type="submit" value="Submit" onClick={(e) => {handleReport('section')}} className='p-3 border-4 border-pesu-gray bg-opacity-40 bg-slate-200 border-opacity-50 max-w-sm mx-auto w-48 shadow-lg rounded-md font-bold tracking-wide text-xl hover:bg-pesu-dark-gray hover:bg-opacity-50 transition duration-500 ease-in-out'>
                                                        Report error
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                )}

                            </div>
                        </div>
                    ) : (
                        <div className="success-validation max-w-xl mx-auto rounded-sm p-1 text-xl bg-pesu-light-brown text-center">
                            <h1 className='mt-4 mb-3 text-2xl font-extrabold text-green-800'>Success!</h1>
                            <p className='text-gray-900 text-xl tracking-tighter'>You have successfully validated your PESU ID. You can now close this and get back to Discord</p>
                            <div className="details my-4 bg-green-800 bg-opacity-30 max-w-xs mx-auto p-2 rounded-sm">
                                <p className='text-gray-700 text-md tracking-tighter'>Section: {successSection}</p>
                                <p className='text-gray-700 text-md tracking-tighter'>Branch: {successBranch}</p>
                            </div>
                            <div className="redirect my-6">
                                <Link href={"https://discord.com/channels/742797665301168220/860224115633160203"}>
                                    <div className="p-3 text-neutral-200 bg-discord-blue max-w-sm mx-auto w-72 shadow-lg font-bold tracking-wide text-xl hover:bg-discord-dark-blue hover:cursor-pointer transition duration-500 ease-in-out">Continue to Discord</div>
                                </Link>
                            </div>
                        </div>
                    )}

                </div>
            )}

        </div>
    )
}

export async function getServerSideProps({ req }) {
    const ip = req.headers['x-real-ip'] || req.connection.remoteAddress;

    return {
        props: {
            ip,
        }
    };
}
