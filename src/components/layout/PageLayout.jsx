import NavBar from './NavBar';

export default function PageLayout({ title, children }) {
  return (
    <>
      <title>{`${title} · Inventory Scanner`}</title>
      <NavBar />
      <main className="page">
        <h1 className="page__title">{title}</h1>
        {children}
      </main>
    </>
  );
}
