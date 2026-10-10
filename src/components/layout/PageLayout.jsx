import NavBar from './NavBar';

// `actions` sit beside the title, e.g. an "Export CSV" button.
export default function PageLayout({ title, actions, children }) {
  return (
    <>
      <title>{`${title} · Salon Stock`}</title>
      <NavBar />
      <main className="page">
        <div className="page__header">
          <h1 className="page__title">{title}</h1>
          {actions && <div className="page__actions">{actions}</div>}
        </div>
        {children}
      </main>
    </>
  );
}
