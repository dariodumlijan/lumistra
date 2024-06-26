import { useEffect, useState } from 'react';
import classNames from 'classnames';
import CtaLink from '@/components/elements/CtaLink';
import Image from '@/components/elements/Image';
import Link from '@/components/elements/Link';
import SeeMore from '@/components/elements/SeeMore';
import useProjects from '@/content/projects';
import useScrollAnimations, { AnimationType } from '@/hooks/useScrollAnimations';
import useTranslations from '@/hooks/useTranslations';
import style from '@/styles/projects/featured.module.scss';
import { getOrderNumber, routes } from '@/utils';
import Section from '../Section';
import type { CursorPosition } from '@/components/elements/SeeMore';

type Props = {
  className?: string
  textPosition: 'top' | 'bottom'
};

export default function Featured(props: Props) {
  const { t } = useTranslations();
  const { projects } = useProjects();
  const [modalShow, setModalShow] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProject = projects[currentIndex];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => {
        const newIndex = prev + 1;
        if (newIndex >= projects.length) return 0;

        return newIndex;
      });
    }, 4000);

    return () => {
      clearInterval(intervalId);
    };
  }, [projects]);

  useEffect(() => {
    const handleMove = ({ x, y }: MouseEvent) => {
      setCursorPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMove);

    return () => {
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  useScrollAnimations({
    featuredText: {
      animation: AnimationType.fadeUp,
      query: '.featured-text',
      offset: 0,
    },
    featuredCover: {
      animation: AnimationType.fadeIn,
      query: '.featured-cover',
      offset: 0,
    },
  });

  const handleShowModal = (shouldShow: boolean) => {
    setModalShow(shouldShow);
  };

  return (
    <Section containerClassName={classNames(style.featuredWrapper, props.className, {
      [style.featuredTop]: props.textPosition === 'top',
      [style.featuredBottom]: props.textPosition === 'bottom',
    })}
    >
      <div className={classNames('featured-text', style.featuredTextWrapper)}>
        <span>{currentProject.title}</span>
        <CtaLink className={style.desktopCTA} href={routes.project(currentProject.slug)}>
          {t('globals.see_full_project')}
        </CtaLink>
        <span className={style.featuredIndex}>
          {getOrderNumber(currentIndex, true)}
        </span>
      </div>
      <SeeMore cursorPosition={cursorPosition} show={modalShow} />
      <Link className="featured-cover" href={routes.project(currentProject.slug)}>
        <Image
          className={style.featuredCover}
          src={currentProject.cover}
          alt={currentProject.title}
          onMouseEnter={() => handleShowModal(true)}
          onMouseLeave={() => handleShowModal(false)}
        />
      </Link>
      <CtaLink className={style.mobileCTA} href={routes.project(currentProject.slug)}>
        {t('globals.see_full_project')}
      </CtaLink>
    </Section>
  );
}
