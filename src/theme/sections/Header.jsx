import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { AppContext } from "../../context/AppContext";
import { useFetch } from "../../hooks/useFetch";

const Header = ({ onToggleSidebar }) => {

	const { i18n } = useTranslation();
	const { app, setApp } = useContext(AppContext);
	const { logout } = useFetch();

	const [languageSelected, setLanguageSelected] = useState(localStorage.getItem("language") || i18n.language);

	const profiles = Array.isArray(app?.profiles) && app.profiles.length > 0
		? app.profiles
		: (() => {
			try {
				return JSON.parse(localStorage.getItem("profiles") || "[]");
			} catch {
				return [];
			}
		})();

	const activeProfileId = Number(app?.profile || localStorage.getItem("profile") || 0);
	const activeProfile = profiles.find((p) => Number(p.id) === activeProfileId);

	const handleProfileChange = (profileId) => {
		const numericId = Number(profileId);
		if (!numericId || numericId === activeProfileId) return;
		localStorage.setItem("profile", numericId);
		setApp((prev) => ({
			...prev,
			profile: numericId,
			profiles,
		}));
	};

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
				<ul className="navbar-nav ms-auto align-items-center">
					{/* Selector de perfiles */}
					{profiles.length > 0 && (
						<li className="nav-item dropdown">
							<button
								type="button"
								className="nav-link dropdown-toggle d-flex align-items-center gap-1 btn btn-link text-decoration-none"
								id="profile-selector-menu"
								data-bs-toggle="dropdown"
								aria-expanded="false"
								aria-label="Seleccionar perfil"
							>
								<i className="bi bi-person-badge" aria-hidden="true"></i>
								<span className="d-none d-sm-inline small fw-semibold">
									{activeProfile?.name || "Perfil"}
								</span>
							</button>
							<ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profile-selector-menu">
								<li>
									<h6 className="dropdown-header">Perfil actual: {activeProfile?.name || "Perfil"}</h6>
								</li>
								{profiles.map((profile) => {
									const isSelected = Number(profile.id) === activeProfileId;
									return (
										<li key={profile.id}>
											<button
												type="button"
												className={`dropdown-item d-flex align-items-center justify-content-between gap-2 ${isSelected ? "active" : ""}`}
												onClick={() => handleProfileChange(profile.id)}
											>
												<span>{profile.name}</span>
												{isSelected && <i className="bi bi-check-lg" aria-hidden="true"></i>}
											</button>
										</li>
									);
								})}
							</ul>
						</li>
					)}
					
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
						<a href="#" className="nav-link dropdown-toggle d-flex align-items-center gap-2 py-0" data-bs-toggle="dropdown">
							{
								app?.image ?
								<img
									src="https://img.magnific.com/vector-gratis/establecimiento-circulos-usuarios_78370-4704.jpg"
									className="user-image rounded-circle shadow m-0 float-none flex-shrink-0"
									alt={app?.name}
									style={{ width: '32px', height: '32px' }}
								/>
								:
								<div className="rounded-circle shadow d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '32px', height: '32px', backgroundColor: 'var(--bs-primary)' }}>
									<i className="bi bi-person fs-5 text-white"/>
								</div>
							}

							<span className="d-none d-md-inline text-nowrap">{app?.name}</span>
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
									{app?.name}
									<small>Miembro desde {new Date().toLocaleDateString()}</small>
								</p>
							</li>
							<li className="user-footer">
								<Link to="/profile" className="btn btn-outline-secondary">Perfil</Link>
								<button type="button" className="btn btn-outline-danger float-end" onClick={async () => { await logout(); window.location.href = "/login"; }}>Cerrar sesión</button>
							</li>
						</ul>
					</li>
				</ul>
			</div>
		</nav>
	);
};

export default Header;