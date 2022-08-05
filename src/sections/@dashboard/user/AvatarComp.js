import { Avatar } from '@mui/material';
import { Storage } from 'aws-amplify';
import React, { useEffect, useState } from 'react';

const AvatarComp = ({ id, name }) => {
  const [img, setImg] = useState('');
  const getFile = async () => {
    const fileURL = await Storage.get(id);
    setImg(fileURL);
  };
  useEffect(() => {
    getFile();
  }, []);
  console.log({ name, img });
  return <Avatar alt={name} src={img} />;
};

export default AvatarComp;
