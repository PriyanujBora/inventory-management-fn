import { Link } from 'react-router';
import PageLayout from '../components/layout/PageLayout';

export default function NotFoundPage() {
  return (
    <PageLayout title="Page not found">
      <p>
        There&apos;s nothing at this address. <Link to="/">Go to the scanner</Link>.
      </p>
    </PageLayout>
  );
}
