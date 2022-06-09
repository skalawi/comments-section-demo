import { App } from './components/app/app';

export const Root = ({ sessionId }: { sessionId?: string }) => {
    return (
        <html lang='en'>
            <head>
                <meta charSet='utf-8' />
                <meta
                    name='viewport'
                    content='minimum-scale=1.0, width=device-width, initial-scale=1.0'
                ></meta>
                <title>Qwik Blank App</title>
                <link
                    rel='preload'
                    href='/Rubik-Bold.ttf'
                    as='font'
                    type='font/ttf'
                    crossOrigin='anonymous'
                ></link>
                <link
                    rel='preload'
                    href='/Rubik-Light.ttf'
                    as='font'
                    type='font/ttf'
                    crossOrigin='anonymous'
                ></link>
                <link
                    rel='preload'
                    href='/Rubik-Regular.ttf'
                    as='font'
                    type='font/ttf'
                    crossOrigin='anonymous'
                ></link>
                <link
                    rel='preload'
                    href='/fonts/icons.ttf?ozcbit'
                    as='font'
                    type='font/ttf'
                    crossOrigin='anonymous'
                ></link>
            </head>
            <body>
                <App sessionId={sessionId} />
                <script src='focus-visible.js' defer></script>
            </body>
        </html>
    );
};
