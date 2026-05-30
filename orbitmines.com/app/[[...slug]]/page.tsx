import ClientApp from './ClientApp';

export function generateStaticParams() {
  return [{ slug: [] as string[] }];
}

export default function Page() {
  return <ClientApp />;
}
