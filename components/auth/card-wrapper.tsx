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
    <Card className='w-[500] shadow-md'>
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
