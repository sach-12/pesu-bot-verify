import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'


export default function Home() {
    const [userId, setUserId] = useState('loading...')
    const router = useRouter()

    useEffect(() => {
        const { code } = router.query
        if (code) {
            axios.post('/api/existing-user', {
                code: code
            })
            .then(res => {
                console.log(res)
                setUserId(res.data.message)
            })
            .catch(err => {
                console.log(err);
                setUserId('error')
            })
        }
    }, [])

    return (
        <div>
            <Head>
                <title>PESU Discord</title>
                <meta name="description" content="PESU Discord Bot Validation" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            
            <main>
                <div className="container">
                    <div className="content">
                        <h1>Discord ID</h1>
                            <p>
                                Discord ID: <strong>{userId}</strong>
                            </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
