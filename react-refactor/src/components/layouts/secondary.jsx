import { Outlet } from 'react-router-dom'

const SecondaryLayout = () => {
    return (
        <div className='secondary-layout'>
            <Outlet />
        </div>
    )
}

export default SecondaryLayout;