import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

const Header = ({ onToggleSidebar }) => {

	const { i18n } = useTranslation();

	const [languageSelected, setLanguageSelected] = useState(localStorage.getItem("language") || i18n.language);

	const handleLanguageChange = (language) => {
		localStorage.setItem("language", language);
		setLanguageSelected(language);
		i18n.changeLanguage(language);
	};

	return (
		<nav className="app-header navbar navbar-expand bg-body">
			<div className="container-fluid">
				{/* Start Navbar Links */}
				<ul className="navbar-nav">
					<li className="nav-item">
						<button
							className="nav-link btn btn-link"
							type="button"
							onClick={onToggleSidebar}
							aria-label="Toggle sidebar"
						>
							<i className="bi bi-list fs-4"></i>
						</button>
					</li>
				</ul>

				{/* End Navbar Links */}
				<ul className="navbar-nav ms-auto">

					{/* Notifications Dropdown */}
					<li className="nav-item dropdown">
						<a
							className="nav-link"
							data-bs-toggle="dropdown"
							href="#"
							aria-label="Notifications: 15 unread"
						>
							<i className="bi bi-bell-fill"></i>
							<span className="navbar-badge badge text-bg-warning">15</span>
						</a>
						<div className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
							<span className="dropdown-item dropdown-header">15 Notifications</span>
							<div className="dropdown-divider"></div>
							<a href="#" className="dropdown-item">
								<i className="bi bi-envelope me-2"></i> 4 new messages
								<span className="float-end text-secondary fs-7">3 mins</span>
							</a>
							<div className="dropdown-divider"></div>
							<a href="#" className="dropdown-item dropdown-footer">See All Notifications</a>
						</div>
					</li>

					{/* Language Menu */}
					<li className="nav-item dropdown">
						<a
							href="#"
							className="nav-link"
							id="language-menu"
							data-bs-toggle="dropdown"
							aria-expanded="false"
							aria-label="Change language"
						>
							<i className="bi bi-translate" aria-hidden="true"></i>
						</a>
						<ul className="dropdown-menu dropdown-menu-end" aria-labelledby="language-menu">
							<li>
								<a className={`dropdown-item ${languageSelected === "en" ? "active" : ""}`} onClick={() => handleLanguageChange("en")}>
									English {languageSelected === "en" && <i className="bi bi-check-lg ms-2" aria-hidden="true"></i>}
								</a>
							</li>
							<li>
								<a className={`dropdown-item ${languageSelected === "es" ? "active" : ""}`} onClick={() => handleLanguageChange("es")}>
									Español {languageSelected === "es" && <i className="bi bi-check-lg ms-2" aria-hidden="true"></i>}
								</a>
							</li>
						</ul>
					</li>

					{/* User Menu Dropdown */}
					<li className="nav-item dropdown user-menu">
						<a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
							<img
								src="https://img.magnific.com/vector-gratis/establecimiento-circulos-usuarios_78370-4704.jpg"
								className="user-image rounded-circle shadow"
								alt="Usuario X"
								style={{ width: '35px', height: '35px' }}
							/>
							<span className="d-none d-xl-inline">Usuario X</span>
						</a>
						<ul className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
							<li className="user-header text-bg-primary">
								<img
									src="https://img.magnific.com/vector-gratis/establecimiento-circulos-usuarios_78370-4704.jpg"
									className="rounded-circle shadow"
									alt="Usuario X"
									style={{ width: '45px', height: '45px', display: "block", marginLeft: "auto", marginRight: "auto" }}
								/>
								<p>
									Usuario X - Desarrollador
									<small>Miembro desde {new Date().toLocaleDateString()}</small>
								</p>
							</li>
							<li className="user-footer">
								<Link to="/profile" className="btn btn-outline-secondary">Perfil</Link>
								<Link to="/login" className="btn btn-outline-danger float-end">Cerrar sesión</Link>
							</li>
						</ul>
					</li>
				</ul>
			</div>
		</nav>
	);
};

export default Header;