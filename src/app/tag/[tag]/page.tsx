import TagClient from './_components/TagClient';

type Props = {
  params: {
    tag: string;
  };
};

export default function TagPage({ params }: Props) {
  const { tag } = params;
  return <TagClient tag={decodeURIComponent(tag)} />;
}
