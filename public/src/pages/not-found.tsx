import React from 'react';
import { Link } from 'wouter';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="text-6xl font-bold mb-6 text-primary">404</div>
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <Link href="/">
            <div className="inline-block w-full py-3 px-6 bg-primary text-primary-foreground rounded-md font-bold cursor-pointer">
              Back to Home
            </div>
          </Link>
          <Link href="/subscribe">
            <div className="inline-block w-full py-3 px-6 bg-secondary text-secondary-foreground rounded-md font-medium cursor-pointer">
              Subscribe to Premium
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;