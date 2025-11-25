'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import DetailsHeader from '@components/home/details/DetailsHeader';
import ImageContainer from '@components/home/details/ImageContainer';
import InfoContainer from '@components/home/details/InfoContainer';
import BlogContainer from '@components/home/details/BlogContainer';
import FinishBtn from '@components/home/details/FinishBtn';
import useGetCourseDetails from '@hooks/home/details/useGetCourseDetails';
import useGetBlogPosting from '@hooks/home/details/useGetBlogPosting';
import usePostSave from '@hooks/home/details/usePostSave';
import usePostComplete from '@hooks/home/details/usePostComplete';
import useGetCompletedList from '@hooks/log/useGetCompletedList';
import useGetSaveCourseList from '@hooks/mypage/useGetSaveCourseList';
import useGetRecommend from '@hooks/home/useGetRecommend';
import useGetPopularCourse from '@hooks/common/useGetPopularCourse';
import useGetRecentCourse from '@hooks/common/useGetRecentCourse';
import useGetCityCourse from '@hooks/home/list/useGetCityCourse';
import useGetRegionalCourse from '@hooks/home/list/useGetRegionalCourse';

export default function Page() {
  const pathname = usePathname();
  const course_id = pathname.split('/').pop();
  const courseIdNumber = course_id ? Number(course_id) : undefined;

  const { mutate: postCompleteMutate } = usePostComplete();
  const { mutate: postSaveMutate } = usePostSave();

  const { data: courseResponse, refetch: refetchCourseDetails } = useGetCourseDetails(courseIdNumber as number);
  const { data: blogResponse } = useGetBlogPosting(courseIdNumber as number);

  const { refetch: refetchCompletedList } = useGetCompletedList();
  const { refetch: refetchSavedList } = useGetSaveCourseList();
  const { refetch: refetchRecommend } = useGetRecommend();
  const { refetch: refetchPopular } = useGetPopularCourse();
  const { refetch: refetchRecentCourse } = useGetRecentCourse();

  const [isBigPage, setIsBigPage] = useState(false);
  const [regionIdNumber, setRegionIdNumber] = useState<number | undefined>(undefined);

  const { refetch: refetchSmallCourse } = useGetCityCourse(regionIdNumber ? regionIdNumber : 1);
  const { refetch: refetchBigCourse } = useGetRegionalCourse(regionIdNumber ? regionIdNumber : 1);

  useEffect(() => {
    const previousUrl = localStorage.getItem('previousUrl');
    if (previousUrl) {
      const previousPathname = new URL(previousUrl).pathname;

      const region_id = previousPathname.split('/').pop();
      const regionId = region_id ? Number(region_id) : undefined;

      setRegionIdNumber(regionId);
      setIsBigPage(previousPathname.includes('/big'));
    }
  }, []);

  // 아직 데이터 안 들어왔을 때
  if (!courseIdNumber || !courseResponse || !blogResponse) {
    return <></>; // 필요하면 로딩 컴포넌트로 바꿔도 됨
  }

  const course = courseResponse.data;
  const posting = blogResponse.data;

  const handleSaveClick = () => {
    postSaveMutate(
      { course_id: course.course_id },
      {
        onSuccess: () => {
          refetchCourseDetails();
          refetchSavedList();
          refetchRecommend();
          refetchPopular();
          refetchRecentCourse();

          if (isBigPage && regionIdNumber) {
            refetchBigCourse();
          }

          if (!isBigPage && regionIdNumber) {
            refetchSmallCourse();
          }
        },
      },
    );
  };

  const handleFinishClick = () => {
    postCompleteMutate(
      { course_id: course.course_id },
      {
        onSuccess: () => {
          refetchCourseDetails();
          refetchCompletedList();
        },
      },
    );
  };

  const handleBackClick = () => {
    if (isBigPage) {
      refetchBigCourse();
    } else {
      refetchSmallCourse();
    }
  };

  return (
    <main className="relative flex h-full w-full flex-col">
      <DetailsHeader
        title={course.name}
        isSaved={course.isSave}
        onClick={handleSaveClick}
        onBackClick={handleBackClick}
      />
      <section className="mt-68pxr flex flex-col overflow-y-auto pb-68pxr">
        <ImageContainer title={course.name} imgSrc={course.image} />
        <InfoContainer
          summary={course.summary}
          address={course.address}
          charge="프로그램별로 이용 요금 상이"
          time="프로그램별로 이용 시간 상이"
          tel={course.tel}
          homepage="홈페이지 정보가 제공되지 않습니다."
        />
        <div className="h-8pxr w-full bg-gray-1" />
        <BlogContainer title={course.name} posting={posting} />
      </section>
      <FinishBtn isComplete={course.isComplete} onClick={handleFinishClick} />
    </main>
  );
}
