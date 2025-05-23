import React, { useContext } from 'react';
import RollingGallery from '../reactbits/RollingGallery';
import RotatingText from '../reactbits/RotatingText';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import EachTeacher from './EachTeacher';
import BasicTeacherInfoContext from '../../contextapi/basicTeacheEnfo/BasicTeacherInfoContext';

const TeacherComponent = () => {
    const { basicTeacherData, featchBasicTeacherData } = useContext(BasicTeacherInfoContext);
    if (!basicTeacherData) {
        featchBasicTeacherData('/public/fakeData/teacherBasicInfo.json');
    }
    console.log("basic Data: ", basicTeacherData);
    return (
        <div>
            <h1 className='text-4xl text-center mt-16 mb-4'>Our Teacher's</h1>

            {/* Rolling gallery */}
            <div className='w-full flex items-center justify-center'>
                <div className='w-[50%]'>
                    <RollingGallery autoplay={true} pauseOnHover={true} />
                </div>
            </div>

            {/* Animated box with dynamic width */}
            <div className='w-full flex items-center justify-center mt-8'>
                <motion.div
                    className='flex items-center gap-2'
                    layout
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <h1 className='text-xl font-medium'>We Create</h1>
                    <motion.div layout>
                        <RotatingText
                            texts={[
                                'Futures',
                                'Leaders of Tomorrow',
                                'Minds That Change the World',
                                'Thinkers, Doers, Innovators',
                                'the Path to Excellence',
                                'Lifelong Learners',
                                'Confidence Through Knowledge',
                                'Opportunities to Shine',
                                'a World of Learning',
                                'the Future, One Student at a Time',
                            ]}
                            mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                            staggerFrom={"last"}
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-120%" }}
                            staggerDuration={0.045}
                            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                            transition={{ type: "spring", damping: 30, stiffness: 400 }}
                            rotationInterval={5000}
                        />
                    </motion.div>
                </motion.div>
            </div>

            {/* Each Teacher */}
            <div className='mt-24 px-10 grid grid-cols-4 gap-2'>
                {
                    basicTeacherData &&
                    basicTeacherData?.map((eachTeacherData) => (
                        <EachTeacher teacherData={eachTeacherData} />
                    ))
                }
            </div>
        </div>
    );
};

export default TeacherComponent;