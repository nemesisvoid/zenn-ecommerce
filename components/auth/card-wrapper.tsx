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
    <Card className='w-[90%] md:w-1/2 lg:w-1/3 bg-white/30 backdrop-blur-md shadow-3xl border border-white/40 my-2'>
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
