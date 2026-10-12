import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import Header from '../sections/Header';
import Nav from '../sections/Nav';
import Footer from '../sections/Footer';
import { AppContextProvider } from '../../context/AppContext';
import { LoaderContextProvider } from '../../context/LoaderContext';
import Loader from '../../components/loaders/Loader';

const Dashboard = () => {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	useEffect(() => {
		// Sincronizar clases requeridas por AdminLTE en el body
		document.body.classList.add('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary');
		return () => {
			document.body.classList.remove('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary', 'sidebar-collapse', 'sidebar-open');
		};
	}, []);

	const handleToggleSidebar = () => {
		setSidebarCollapsed((prev) => {
			const nextState = !prev;
			if (window.innerWidth < 992) {
				// En pantallas pequeñas AdminLTE usa sidebar-open
				document.body.classList.toggle('sidebar-open', nextState);
				document.body.classList.remove('sidebar-collapse');
			} else {
				// En pantallas grandes AdminLTE usa sidebar-collapse
				document.body.classList.toggle('sidebar-collapse', nextState);
				document.body.classList.remove('sidebar-open');
			}
			return nextState;
		});
	};

	return (
		<AppContextProvider>
            <LoaderContextProvider>
				<div className="app-wrapper">
					<Header onToggleSidebar={handleToggleSidebar} />
					<Nav />
					<main className="app-main">
						<Outlet />
					</main>
					<Footer />
				</div>
				<Loader/>
			</LoaderContextProvider>
		</AppContextProvider>
	);
};

export default Dashboard;