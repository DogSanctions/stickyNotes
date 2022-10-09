import { Link } from 'react-router-dom'

const Public = () => {
    const content = (
        <section className="public">
        <header>
            <h1>Welcome to <span className="nowrap">Blank's Computer Repair Shop!</span></h1>
        </header>
        <main className="public__main">
                <p>Located in beautiful downtown in Fremont, Blank's Computer Repair Shop provides 
                a trained staff ready to meet your tech repair needs.</p>
            <address className="public__addr">
                Blank's Computer Repair Shop<br />
                123 Null Drive<br />
                Fremont, CA 12345<br />
                <a href="tel:+10000000000">(000) 000-0000</a>
            </address>
            <br />
            <p>Owner: Blank Null </p>
        </main>
        <footer>
            <Link to="/login">Employee Login</Link>
        </footer>
    </section>
    )
    return content
}

export default Public