/* eslint-disable no-unneeded-ternary */
/* eslint-disable dot-notation */
// import { Link as RouterLink } from 'react-router-dom';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { DataStore, Storage } from 'aws-amplify';
import { nanoid } from 'nanoid';
// form
import { useForm } from 'react-hook-form';

// @mui
import {
  Card,
  Link,
  Container,
  Typography,
  IconButton,
  Stack,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Box,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// components
import Page from '../components/Page';
// hooks
import useResponsive from '../hooks/useResponsive';
import { Users, UserStatus } from '../models';
import AvatarComp from '../sections/@dashboard/user/AvatarComp';
// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 680,
  margin: 'auto',
  minHeight: '60vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function EditUser() {
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
  const [stateSanckbar, setStateSnackBar] = useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
  });
  const navigate = useNavigate();
  const [file, setFile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [image, setImage] = useState('');
  const uId = window.location.hash.slice(1);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();
  const successSnackBar = () => {
    setStateSnackBar({ ...stateSanckbar, open: true });
    console.log('stateSanckbar: ', stateSanckbar);
    setInterval(() => {
      setStateSnackBar({ ...stateSanckbar, open: false });
    }, 3000);
  };
  const onSubmit = (data) => {
    const fileId = nanoid(10);
    setIsLoading(true);
    try {
      Storage.put(`${fileId}-&&-${file.name}`, file, {
        contentType: 'image/png', // contentType is optional
        resumable: true,
        completeCallback: async (event) => {
          console.log(`Successfully uploaded ${event.key}`, event);
          data['img'] = `${fileId}-&&-${file.name}`;
          data['verified'] = true;
          data['status'] = UserStatus.ACTIVE;
          console.log('data: ', data);
          try {
            DataStore.save(new Users(data));
            setIsLoading(false);
            reset();
            setImage('');
            successSnackBar();
          } catch (error) {
            console.log({ error });
          }
        },
        progressCallback: (progress) => {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
        },
        errorCallback: (err) => {
          setIsLoading(false);
          console.error('Unexpected error while uploading', err);
        },
      });
    } catch (error) {
      console.log('Error uploading file: ', error);
      setIsLoading(false);
    }
    // navigate('/dashboard', { replace: true });
  };

  const handleUpdateOnSubmit = (data) => {
    setIsLoading(true);
    try {
      Storage.put(editUser.img, file, {
        contentType: 'image/png', // contentType is optional
        resumable: true,
        completeCallback: async (event) => {
          console.log(`Successfully uploaded ${event.key}`, event);
          data['img'] = editUser.img;
          data['verified'] = data.verified === 'yes' ? true : false;
          try {
            // DataStore.save(new Users(data));
            Users.copyOf(editUser, (updated) => {
              updated.name = data.name;
              updated.role = data.role;
              updated.company = data.company;
              updated.status = data.status;
              updated.verified = data.verified;
            });
            setIsLoading(false);
            navigate('/dashboard/user');
            setImage('');
          } catch (error) {
            console.log({ error });
            setIsLoading(false);
          }
        },
        progressCallback: (progress) => {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
        },
        errorCallback: (err) => {
          console.error('Unexpected error while uploading', err);
        },
      });
    } catch (error) {
      data['img'] = editUser.img;
      data['verified'] = data.verified === 'yes' ? true : false;
      console.log('updated data: ', data);
      try {
        // DataStore.save(new Users(data));
        DataStore.save(
          Users.copyOf(editUser, (updated) => {
            updated.name = data.name;
            updated.role = data.role;
            updated.company = data.company;
            updated.status = data.status;
            updated.verified = data.verified;
          })
        );
        setIsLoading(false);
        navigate('/dashboard/user');
        reset();
        setImage('');
      } catch (error) {
        console.log({ updateError: error });
      }
      console.log('Error uploading file: ', error);
    }
    // navigate('/dashboard', { replace: true });
  };
  const handleImage = async (e) => {
    const inpImg = e.target.files[0];
    setFile(inpImg);
    const img = URL.createObjectURL(inpImg);
    setImage(img);
  };
  const getUser = async (id) => {
    const user = await DataStore.query(Users, id);
    setEditUser(user);
  };

  useEffect(() => {
    if (uId) {
      getUser(uId);
    }
  }, []);
  console.log({ editUser });

  const { vertical, horizontal, open } = stateSanckbar;
  return (
    <Page title="Add New User">
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        // onClose={handleClose}
        message="New User added"
        key={vertical + horizontal}
      />
      {isLoading ? (
        <Box sx={{ minWidth: '100%', minHeight: '80vh' }} display="flex" justifyContent="center" alignItems="center">
          <Stack>
            <Typography>Please wait</Typography>
            <CircularProgress size={80} />
          </Stack>
        </Box>
      ) : (
        <>
          {editUser && (
            <RootStyle>
              <Container>
                <ContentStyle>
                  <Typography variant="h4" gutterBottom>
                    Edit User
                  </Typography>
                  <form onSubmit={handleSubmit(handleUpdateOnSubmit)}>
                    <Stack spacing={3}>
                      <Stack alignItems="center">
                        <IconButton
                          sx={{ width: '46px' }}
                          color="primary"
                          aria-label="upload picture"
                          component="label"
                        >
                          <input hidden accept="image/*" type="file" onChange={handleImage} />
                          <PhotoCamera />
                        </IconButton>
                        {(image || editUser) && image ? (
                          <img src={image} alt="upload" />
                        ) : (
                          <AvatarComp name={editUser?.name} id={editUser?.img} />
                        )}
                      </Stack>
                      <TextField
                        fullWidth
                        label="Full Name"
                        defaultValue={editUser.name}
                        {...register('name', { required: true })}
                      />
                      {errors.name && (
                        <Typography variant="caption" display="block" mt={-10}>
                          Please enter your full name
                        </Typography>
                      )}
                      <TextField
                        fullWidth
                        label="Company name"
                        {...register('company', { required: true })}
                        defaultValue={editUser.company}
                      />
                      {errors.company && (
                        <Typography variant="caption" display="block" mt={-10}>
                          Company name is required
                        </Typography>
                      )}
                      <TextField
                        fullWidth
                        label="Role/Position"
                        {...register('role', { required: true })}
                        defaultValue={editUser?.role}
                      />
                      {errors.role && (
                        <Typography variant="caption" display="block" mt={-10}>
                          Role is required
                        </Typography>
                      )}

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <FormControl fullWidth>
                          <InputLabel id="demo-simple-select-label">Status</InputLabel>
                          <Select
                            defaultValue={editUser?.status}
                            label="Status"
                            labelId="demo-simple-select-label"
                            {...register('status', { required: true })}
                          >
                            <MenuItem value={'ACTIVE'}>Active</MenuItem>
                            <MenuItem value={'BANNED'}>Banned</MenuItem>
                          </Select>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel id="demo-simple-select-label2">Verified</InputLabel>
                          <Select
                            defaultValue={editUser.verified ? 'yes' : 'no'}
                            label="Verified"
                            labelId="demo-simple-select-label2"
                            {...register('verified', { required: true })}
                          >
                            <MenuItem value={'yes'}>Yes</MenuItem>
                            <MenuItem value={'no'}>No</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>

                      <Button fullWidth size="large" type="submit" variant="contained">
                        UPDATE USER
                      </Button>
                    </Stack>
                  </form>
                </ContentStyle>
              </Container>
            </RootStyle>
          )}
          {!uId && (
            <RootStyle>
              <Container>
                <ContentStyle>
                  <Typography variant="h4" gutterBottom>
                    Add New User
                  </Typography>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                      <Stack alignItems="center">
                        <IconButton
                          sx={{ width: '46px' }}
                          color="primary"
                          aria-label="upload picture"
                          component="label"
                        >
                          <input hidden accept="image/*" type="file" onChange={handleImage} />
                          <PhotoCamera />
                        </IconButton>
                        {image && <img src={image} alt="upload" />}
                      </Stack>
                      <TextField fullWidth label="Full Name" {...register('name', { required: true })} />
                      {errors.name && (
                        <Typography variant="caption" display="block" mt={-10}>
                          Please enter your full name
                        </Typography>
                      )}
                      <TextField fullWidth label="Company name" {...register('company', { required: true })} />
                      {errors.company && (
                        <Typography variant="caption" display="block" mt={-10}>
                          Company name is required
                        </Typography>
                      )}
                      <TextField fullWidth label="Role/Position" {...register('role', { required: true })} />
                      {errors.role && (
                        <Typography variant="caption" display="block" mt={-10}>
                          Role is required
                        </Typography>
                      )}

                      <Button fullWidth size="large" type="submit" variant="contained">
                        ADD USER
                      </Button>
                    </Stack>
                  </form>
                </ContentStyle>
              </Container>
            </RootStyle>
          )}
        </>
      )}
    </Page>
  );
}
