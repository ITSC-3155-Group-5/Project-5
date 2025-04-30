/* eslint-disable no-alert, react/jsx-wrap-multilines */
import React from 'react';
import {
    Box,
    Button,
    TextField,
    FormControlLabel,
    Switch
} from '@mui/material';
import './userDetail.css';
import axios from 'axios';

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: undefined,
            selectedFile: null,
            dirty: false
        };
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.saveProfile      = this.saveProfile.bind(this);
        this.toggleTheme      = this.toggleTheme.bind(this);
    }

    componentDidMount() {
        const new_user_id = this.props.match.params.userId;
        this.handleUserChange(new_user_id);
    }

    componentDidUpdate() {
        const new_user_id = this.props.match.params.userId;
        const current_user_id = this.state.user?._id;
        if (current_user_id !== new_user_id){
            this.handleUserChange(new_user_id);
        }
    }

    handleUserChange(user_id) {
        axios.get("/user/" + user_id)
          .then((response) => {
              const new_user = response.data;
              this.setState({
                  user: new_user,
                  dirty: false
              });
              const main_content = "User Details for " + new_user.first_name + " " + new_user.last_name;
              this.props.changeMainContent(main_content);
          });
    }

    handleFileChange = (event) => {
        this.setState({ selectedFile: event.target.files[0] });
    };
    
    handleUpload = (event) => {
        event.preventDefault();
        const { selectedFile } = this.state;
        if (!selectedFile) {
            alert('Please select a file first!');
            return;
        }
        const formData = new FormData();
        formData.append('uploadedphoto', selectedFile);
    
        axios.post('/profilePic', formData, {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(() => {
            alert('Profile picture uploaded successfully!');
            this.handleUserChange(this.state.user._id);
            this.setState({ selectedFile: null });
        })
        .catch((error) => {
            console.error('Error uploading profile picture:', error);
            alert('Upload failed.');
        });
    };

    // Track text‐field edits
    handleFieldChange(event) {
        const { name, value } = event.target;
        this.setState(prev => ({
            user:  { ...prev.user, [name]: value },
            dirty: true
        }));
    }

    // Save profile fields to server
    saveProfile() {
        const u = this.state.user;
        const updates = {
            first_name:  u.first_name,
            last_name:   u.last_name,
            location:    u.location,
            description: u.description,
            occupation:  u.occupation,
            websiteUrl:  u.websiteUrl
        };
        axios.put(`/user/${u._id}`, updates)
            .then(({ data }) => {
                this.setState({ user: data, dirty: false });
                alert("Profile saved!");
            })
            .catch(err => {
                console.error(err);
                alert("Save failed.");
            });
    }

    // Toggle light/dark theme
    toggleTheme() {
        const u = this.state.user;
        const next = u.themePreference === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        axios.put(`/user/${u._id}`, { themePreference: next })
            .then(() => this.setState(prev => ({
                user: { ...prev.user, themePreference: next }
            })))
            .catch(console.error);
    }

    render() {
        const { user, selectedFile, dirty } = this.state;
        const isOwn = this.props.loggedInUserId === user?._id;

        if (!user) return <div/>;

        return (
            <div>
                <Box noValidate autoComplete="off">

                    {/* Profile Picture */}
                    <div style={{ marginBottom: "20px" }}>
                        <img
                            src={"/images/" + (user.profilePic || "default_profile.jpg")}
                            alt="Profile"
                            style={{ width: 150, height: 150, borderRadius: "50%", objectFit: "cover" }}
                        />
                    </div>

                    {/* User Photos Button */}
                    <Button variant="contained" component="a" href={"#/photos/" + user._id}>
                        User Photos
                    </Button>

                    {/* Editable Fields */}
                    {["first_name","last_name","location","occupation","websiteUrl"].map(f => (
                        <TextField
                            key={f}
                            name={f}
                            label={f.replace("_"," ")}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={user[f] || ""}
                            onChange={isOwn ? this.handleFieldChange : undefined}
                            disabled={!isOwn}
                        />
                    ))}

                    <TextField
                        name="description"
                        label="Description"
                        variant="outlined"
                        multiline rows={4}
                        fullWidth margin="normal"
                        value={user.description || ""}
                        onChange={isOwn ? this.handleFieldChange : undefined}
                        disabled={!isOwn}
                    />

                    {/* Theme Toggle & Save */}
                    {isOwn && (
                        <>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={user.themePreference==="dark"}
                                        onChange={this.toggleTheme}
                                    />
                                }
                                label="Dark Mode"
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={this.saveProfile}
                                disabled={!dirty}
                                style={{ marginTop: 16 }}
                            >
                                Save Profile
                            </Button>
                        </>
                    )}

                    {/* Upload / Change Profile Picture */}
                    {isOwn && (
                        <div style={{ marginTop: 20 }}>
                            <h3>Upload / Change Profile Picture</h3>
                            <input type="file" accept="image/*" onChange={this.handleFileChange} />
                            {selectedFile && (
                                <div style={{ marginTop: 10 }}>
                                    <img
                                        src={URL.createObjectURL(selectedFile)}
                                        alt="Selected Profile"
                                        style={{ width: 150, height: 150, borderRadius: "50%", objectFit: "cover" }}
                                    />
                                </div>
                            )}
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={this.handleUpload}
                                style={{ marginLeft: 10, marginTop: 10 }}
                            >
                                Upload
                            </Button>
                        </div>
                    )}

                </Box>
            </div>
        );
    }
}

export default UserDetail;
