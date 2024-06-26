import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { map } from 'lodash';
import Head from 'next/head';
import Arrow from '@/assets/svg/arrow.svg';
import useProjects from '@/content/projects';
import useScrollAnimations, { AnimationType } from '@/hooks/useScrollAnimations';
import useTranslations from '@/hooks/useTranslations';
import projectStyle from '@/styles/projects/selected.module.scss';
import style from '@/styles/work.module.scss';
import { routes } from '@/utils';
import Contact from '../containers/Contact';
import Section from '../containers/Section';
import Image from '../elements/Image';
import Link from '../elements/Link';
import SeeMore from '../elements/SeeMore';
import TextMask from '../elements/TextMask';
import type { CursorPosition } from '../elements/SeeMore';
import type { Project } from '@/types/projects';

enum View {
  grid,
  list,
}

export default function Work() {
  const { t } = useTranslations();
  const { projects } = useProjects();
  const [view, setView] = useState(View.grid);
  const [modalShow, setModalShow] = useState(false);
  const [modalProject, setModalProject] = useState<Project | null>();
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>(null);
  const timeoutID = useRef<any>();

  useScrollAnimations({
    heroTitle: {
      animation: AnimationType.fadeUp,
      query: '.hero-animation-title',
      offset: 0,
    },
  });

  useEffect(() => {
    const handleMove = ({ x, y }: MouseEvent) => {
      setCursorPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMove);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (timeoutID.current) clearTimeout(timeoutID.current);
    };
  }, []);

  const handleViewChange = (option: View) => {
    setView(option);
  };

  const handleModalChange = (project: Project | null) => {
    if (timeoutID.current) clearTimeout(timeoutID.current);

    const willShowModal = !!project;
    if (willShowModal) {
      setModalProject(project);
    } else {
      timeoutID.current = setTimeout(() => {
        setModalProject(project);
      }, 500);
    }

    setModalShow(willShowModal);
  };

  return (
    <main>
      <Head>
        <title>{t('work.title')}</title>
        <meta name="transition-title" content={t('routes.work')} />
      </Head>
      <Section containerClassName={style.heroWrapper}>
        <TextMask identifier="hero-animation-title">
          <h1>{t('work.hero')}</h1>
        </TextMask>
      </Section>
      <Section containerClassName={classNames(style.gridWrapper, {
        [style.noGap]: View.list === view,
      })}
      >
        <div className={style.viewModeWrapper}>
          <span>{t('work.view-mode.label')}</span>
          <div className={style.viewModeSelect}>
            <span
              className={classNames(style.viewModeOption, {
                [style.viewModeActive]: View.list === view,
              })}
              onClick={() => handleViewChange(View.list)}
            >
              {t('work.view-mode.list')}
            </span>
            <span className={style.viewModeSplitter}>/</span>
            <span
              className={classNames(style.viewModeOption, {
                [style.viewModeActive]: View.grid === view,
              })}
              onClick={() => handleViewChange(View.grid)}
            >
              {t('work.view-mode.grid')}
            </span>
          </div>
        </div>
        {View.list === view && (
          <div
            className={classNames(style.projectModal, {
              [style.projectModalList]: View.list === view,
              [style.projectModalActive]: modalShow,
            })}
            style={{
              position: 'fixed',
              ...(cursorPosition && {
                left: cursorPosition.x,
                top: cursorPosition.y,
              }),
            }}
          >
            {modalProject && (
              <Image
                className={style.projectModalCover}
                src={modalProject.cover}
                alt={modalProject.title}
              />
            )}
          </div>
        )}
        {View.grid === view && modalProject && (
          <SeeMore cursorPosition={cursorPosition} show={modalShow} />
        )}
        {View.list === view && map(projects, (project) => (
          <Link
            key={project.slug}
            className={style.projectListItem}
            href={routes.project(project.slug)}
            onMouseEnter={() => handleModalChange(project)}
            onMouseLeave={() => handleModalChange(null)}
          >
            <span>{project.title}</span>
            {modalProject?.slug === project.slug && (
              <Arrow className={style.projectListArrow} />
            )}
          </Link>
        ))}
        {View.grid === view && map(projects, (project) => (
          <Link
            key={project.slug}
            className={classNames(style.gridProject, projectStyle.projectContainer)}
            href={routes.project(project.slug)}
          >
            <Image
              className={classNames(style.gridCover, projectStyle.projectCover)}
              src={project.cover}
              alt={project.title}
              onMouseEnter={() => handleModalChange(project)}
              onMouseLeave={() => handleModalChange(null)}
            />
            <span className={classNames(projectStyle.projectTitle, projectStyle.projectTitleMin)}>{project.title}</span>
          </Link>
        ))}
      </Section>
      <Contact title={t('contact.cta.title-alt')} />
    </main>
  );
}
