'use client';

import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import BackButton from './back-button';
import Header from './header';
import Social from './social';

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonLink: string;
  showSocial?: boolean;
}

const CardWrapper = ({ children, headerLabel, backButtonLink, backButtonLabel, showSocial }: CardWrapperProps) => {
  return (
    <Card
      className='w-[90%] md:w-1/2 lg:w-1/3 my-2
  bg-[#0e0c0a]/80 backdrop-blur-md
  border border-[#c5a05a]/40
  shadow-[0_0_60px_-10px_rgba(197,160,90,0.15),0_0_0_0.5px_rgba(197,160,90,0.2)]
  rounded-2xl'>
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}

      <CardFooter>
        <BackButton
          label={backButtonLabel}
          link={backButtonLink}
        />
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;
