import PapersRedirect from './PapersRedirect';

export function generateStaticParams() {
  // Generate the bare /papers entry; deep `/papers/...` paths fall back to
  // the 404 page which also renders this redirect logic from the URL.
  return [{ slug: [] as string[] }];
}

export const dynamicParams = false;

export default function Page() {
  return <PapersRedirect />;
}
