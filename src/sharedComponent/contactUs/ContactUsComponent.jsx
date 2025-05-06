import React, { useContext } from 'react';
import GoogleMapEmbed from '../GoogleMapEmbed';
import EiiContext from '../../contextapi/eiiSearch/EiiSearchContext';
import { SocialIcon } from 'react-social-icons';

const ContactUsComponent = () => {
    const { data } = useContext(EiiContext);
    const latitude = Number(data?.latitude);
    const longitude = Number(data?.longitude);
    // const foundingDate = new Date(data?.founding_date);
    // Adress: { data?.address ? data?.address : "No address is given!" }
    // Phone: { data?.phone_number ? data?.phone_number : "No phone number is given!" }
    return (
        <div className='min-h-[100dvh] bg-[#F0F8FF]'>
            {/* For Map */}
            <div>
                <GoogleMapEmbed latitude={latitude} longitude={longitude} width={"100%"} height={"300"} />
            </div>
            {/* Other Information */}
            <div className='pt-4'>
                <h1 className='text-center text-4xl text-[#a5158c] font-extralight'>Lets's <span className='font-bold'>Talk</span></h1>
                <div className='mt-[6rem]'>
                    <div className='mt-4 w-full flex justify-around'>
                        {/* Contact Details */}
                        <div>
                            <p className='text-xl font-bold'>{data?.name_eng}</p>
                            <div className='mt-2'>
                                <p>{data?.address ? data?.address : "No address is given!"}</p>
                                <p>{data?.phone_number ? data?.phone_number : "No phone number is given!"}</p>
                                <p>{data?.email}</p>
                            </div>
                        </div>
                        {/* Social Details */}
                        <div>
                            <p className='text-xl font-bold'>Social</p>
                            <div className='flex items-center gap-2 mt-2'>
                                <SocialIcon network="facebook" />
                                <SocialIcon network="twitter" />
                                <SocialIcon network="instagram" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUsComponent;