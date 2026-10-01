import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'عالم خالد | K7',description:'مساحتك الشخصية للعمل والمشاريع والصور',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><body>{children}</body></html>}
