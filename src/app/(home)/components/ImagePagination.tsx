import { pageAtom, totalPageAtom } from '@/store/app';
import { useAtom, useAtomValue } from 'jotai';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { PageInput } from './pagination/PageInput';
import { PageNumbers } from './pagination/PageNumbers';
import { PaginationButton } from './pagination/PaginationButton';

export default function ImagePagination() {
  const [page, setPage] = useAtom(pageAtom);
  const totalPage = useAtomValue(totalPageAtom);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="flex items-center justify-between px-2 py-1 @container">
      <PageInput currentPage={page} totalPage={totalPage} onPageChange={handlePageChange} />

      <div className="hidden items-center justify-center gap-1 text-xs text-muted-foreground @lg:flex">
        关注
        <a className="text-blue-400 hover:underline" href="https://t.me/CosineGallery">
          Cosine 🎨 Gallery
        </a>
        每天看甜妹！
      </div>

      <div className="flex items-center gap-1">
        <PaginationButton onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          <FaChevronLeft className="h-3.5 w-3.5" />
        </PaginationButton>

        <PageNumbers currentPage={page} totalPage={totalPage} onPageChange={handlePageChange} />

        <PaginationButton onClick={() => handlePageChange(page + 1)} disabled={page === totalPage}>
          <FaChevronRight className="h-3.5 w-3.5" />
        </PaginationButton>
      </div>
    </div>
  );
}
