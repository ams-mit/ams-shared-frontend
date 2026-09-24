import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Announcement, AnnouncementRequest } from '../types/announcement.types';
import { announcementApi } from '../api/announcementApi';

interface AnnouncementState {
  announcements: Announcement[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AnnouncementState = {
  announcements: [],
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAnnouncements',
  async (role: string, { rejectWithValue }) => {
    try {
      return await announcementApi.getAnnouncementsByRole(role);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch announcements');
    }
  }
);

export const publishAnnouncement = createAsyncThunk(
  'announcements/publishAnnouncement',
  async (request: AnnouncementRequest, { rejectWithValue }) => {
    try {
      return await announcementApi.publishAnnouncement(request);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to publish announcement');
    }
  }
);

export const announcementSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    clearAnnouncementFeedback: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // fetchAnnouncements
    builder.addCase(fetchAnnouncements.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAnnouncements.fulfilled, (state, action: PayloadAction<Announcement[]>) => {
      state.loading = false;
      state.announcements = [...action.payload];
    });
    builder.addCase(fetchAnnouncements.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // publishAnnouncement
    builder.addCase(publishAnnouncement.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(publishAnnouncement.fulfilled, (state, action: PayloadAction<Announcement>) => {
      state.actionLoading = false;
      state.announcements = [action.payload, ...state.announcements.filter((a) => a.id !== action.payload.id)];
      state.successMessage = `Notice "${action.payload.title}" published successfully for target audience: ${action.payload.targetRole}`;
    });
    builder.addCase(publishAnnouncement.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearAnnouncementFeedback } = announcementSlice.actions;
export default announcementSlice.reducer;
