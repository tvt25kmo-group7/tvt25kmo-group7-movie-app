import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/movieCard';

import './groupDetails.css';

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authLoading, authenticatedFetch } = useAuth();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [joinRequestSubmitting, setJoinRequestSubmitting] = useState(false);
  const [joinRequestError, setJoinRequestError] = useState('');

  const [joinRequests, setJoinRequests] = useState([]);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);
  const [joinRequestsError, setJoinRequestsError] = useState('');
  const [joinRequestActionUserId, setJoinRequestActionUserId] =
    useState(null);

  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState('');
  const [memberActionUserId, setMemberActionUserId] = useState(null);

  const [leavingGroup, setLeavingGroup] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);
  const [groupActionError, setGroupActionError] = useState('');

  useEffect(() => {
    if (authLoading) {
      return;
    }

    async function fetchGroup() {
      setLoading(true);
      setError('');

      try {
        const response =
          user ?
            await authenticatedFetch(`/api/groups/${id}`)
          : await fetch(`/api/groups/${id}`);

        if (response.status === 404) {
          throw new Error('Group not found');
        }

        if (!response.ok) {
          throw new Error('Group could not be loaded');
        }

        const data = await response.json();
        setGroup(data);

        if (data.isOwner || data.membershipStatus === 'member') {
          setMembersLoading(true);
          setMembersError('');

          try {
            const membersResponse = await authenticatedFetch(
              `/api/groups/${id}/members`,
            );

            const membersData = await membersResponse
              .json()
              .catch(() => []);

            if (!membersResponse.ok) {
              throw new Error(
                membersData.error || 'Group members could not be loaded',
              );
            }

            setMembers(
              Array.isArray(membersData) ? membersData : [],
            );
          } catch (membersFetchError) {
            setMembersError(membersFetchError.message);
          } finally {
            setMembersLoading(false);
          }
        } else {
          setMembers([]);
          setMembersError('');
        }

        if (data.isOwner) {
          setJoinRequestsLoading(true);
          setJoinRequestsError('');

          try {
            const joinRequestsResponse = await authenticatedFetch(
              `/api/groups/${id}/join-requests`,
            );

            const joinRequestsData = await joinRequestsResponse
              .json()
              .catch(() => []);

            if (!joinRequestsResponse.ok) {
              throw new Error(
                joinRequestsData.error ||
                  'Join requests could not be loaded',
              );
            }

            setJoinRequests(
              Array.isArray(joinRequestsData) ? joinRequestsData : [],
            );
          } catch (requestError) {
            setJoinRequestsError(requestError.message);
          } finally {
            setJoinRequestsLoading(false);
          }
        } else {
          setJoinRequests([]);
        }
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGroup();
  }, [id, user, authLoading, authenticatedFetch]);

  const handleJoinRequest = async () => {
    setJoinRequestSubmitting(true);
    setJoinRequestError('');

    try {
      const response = await authenticatedFetch(
        `/api/groups/${id}/join-requests`,
        {
          method: 'POST',
        },
      );

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseData.error || 'Join request could not be sent',
        );
      }

      setGroup(currentGroup => ({
        ...currentGroup,
        membershipStatus: 'pending',
      }));
    } catch (requestError) {
      setJoinRequestError(requestError.message);
    } finally {
      setJoinRequestSubmitting(false);
    }
  };

  const handleJoinRequestAction = async (requestedUserId, method) => {
    const handledRequest = joinRequests.find(
      request => request.userId === requestedUserId,
    );

    setJoinRequestActionUserId(requestedUserId);
    setJoinRequestsError('');

    try {
      const response = await authenticatedFetch(
        `/api/groups/${id}/join-requests/${requestedUserId}`,
        {
          method,
        },
      );

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseData.error || 'Join request could not be managed',
        );
      }

      setJoinRequests(currentRequests =>
        currentRequests.filter(
          request => request.userId !== requestedUserId,
        ),
      );

      if (method === 'PATCH' && handledRequest) {
        setMembers(currentMembers => {
          const alreadyListed = currentMembers.some(
            member => member.userId === requestedUserId,
          );

          if (alreadyListed) {
            return currentMembers;
          }

          return [
            ...currentMembers,
            {
              userId: requestedUserId,
              username: handledRequest.username,
              isOwner: false,
              joinedAt: responseData.joinedAt,
            },
          ];
        });
      }
    } catch (requestError) {
      setJoinRequestsError(requestError.message);
    } finally {
      setJoinRequestActionUserId(null);
    }
  };

  const handleLeaveGroup = async () => {
    setLeavingGroup(true);
    setGroupActionError('');

    try {
      const response = await authenticatedFetch(
        `/api/groups/${id}/members/me`,
        {
          method: 'DELETE',
        },
      );

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseData.error || 'Group could not be left',
        );
      }

      setMembers([]);
      setGroup(currentGroup => ({
        ...currentGroup,
        isOwner: false,
        membershipStatus: null,
        media: [],
      }));
    } catch (leaveError) {
      setGroupActionError(leaveError.message);
    } finally {
      setLeavingGroup(false);
    }
  };

  const handleRemoveMember = async memberId => {
    setMemberActionUserId(memberId);
    setMembersError('');

    try {
      const response = await authenticatedFetch(
        `/api/groups/${id}/members/${memberId}`,
        {
          method: 'DELETE',
        },
      );

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseData.error || 'Group member could not be removed',
        );
      }

      setMembers(currentMembers =>
        currentMembers.filter(member => member.userId !== memberId),
      );
    } catch (removeError) {
      setMembersError(removeError.message);
    } finally {
      setMemberActionUserId(null);
    }
  };

  const handleDeleteGroup = async () => {
    setDeletingGroup(true);
    setGroupActionError('');

    try {
      const response = await authenticatedFetch(
        `/api/groups/${id}`,
        {
          method: 'DELETE',
        },
      );

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseData.error || 'Group could not be deleted',
        );
      }

      navigate('/groups');
    } catch (deleteError) {
      setGroupActionError(deleteError.message);
    } finally {
      setDeletingGroup(false);
    }
  };

  if (loading) {
    return <p>Loading group...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!user) {
    return (
      <section className="group-details-page">
        <aside className="group-details-sidebar">
          <h1>{group.name}</h1>
          <p>Log in to request to join this group.</p>
        </aside>
      </section>
    );
  }

  if (!group.isOwner && group.membershipStatus === null) {
    return (
      <section className="group-details-page">
        <aside className="group-details-sidebar">
          <h1>{group.name}</h1>
          <p>You are not a member of this group.</p>

          <button
            type="button"
            className="button-primary group-action-button"
            onClick={handleJoinRequest}
            disabled={joinRequestSubmitting}
          >
            {joinRequestSubmitting ?
              'Sending request...'
            : 'Request to Join'}
          </button>

          {joinRequestError && (
            <p className="group-error" role="alert">
              {joinRequestError}
            </p>
          )}
        </aside>
      </section>
    );
  }

  if (!group.isOwner && group.membershipStatus === 'pending') {
    return (
      <section className="group-details-page">
        <aside className="group-details-sidebar">
          <h1>{group.name}</h1>
          <p role="status">
            Your request to join this group is pending.
          </p>
        </aside>
      </section>
    );
  }

  if (!group.isOwner && group.membershipStatus !== 'member') {
    return (
      <section className="group-details-page">
        <aside className="group-details-sidebar">
          <h1>{group.name}</h1>
          <p>You are not a member of this group.</p>
        </aside>
      </section>
    );
  }

  const media = Array.isArray(group.media) ? group.media : [];

  const memberList = (
    <section className="group-members">
      <h3>Current Members</h3>

      {membersLoading && <p>Loading members...</p>}

      {membersError && (
        <p className="group-error" role="alert">
          {membersError}
        </p>
      )}

      {!membersLoading &&
        !membersError &&
        members.length === 0 && (
          <p>No group members found.</p>
        )}

      {members.map(member => (
        <div className="current-member" key={member.userId}>
          <div className="current-member__identity">
            <strong>{member.username}</strong>

            {member.isOwner && (
              <span className="current-member__role">Owner</span>
            )}
          </div>

          {group.isOwner && !member.isOwner && (
            <button
              type="button"
              className="button-danger"
              onClick={() => handleRemoveMember(member.userId)}
              disabled={memberActionUserId !== null}
            >
              {memberActionUserId === member.userId ?
                'Removing...'
              : 'Remove'}
            </button>
          )}
        </div>
      ))}
    </section>
  );

  const playlist = (
    <section className="group-playlist">
      <h2>Shared Movies and Series</h2>

      {media.length === 0 ? (
        <p>No movies or series have been shared with this group yet.</p>
      ) : (
        <div className="group-playlist__grid">
          {media.map(item => (
            <MovieCard
              key={`${item.mediaType}-${item.tmdbId}`}
              movieId={item.tmdbId}
              mediaType={item.mediaType}
              title={item.title}
              posterPath={item.posterPath}
            />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <section className="group-details-page">
      <aside className="group-details-sidebar">
        <h1>{group.name}</h1>

        <p>
          {group.isOwner ?
            'You are the creator of this group.'
          : 'You are a member of this group.'}
        </p>

        {group.isOwner ? (
          <button
            type="button"
            className="button-danger group-action-button"
            onClick={handleDeleteGroup}
            disabled={deletingGroup}
          >
            {deletingGroup ? 'Deleting...' : 'Delete Group'}
          </button>
        ) : (
          <button
            type="button"
            className="button-danger group-action-button"
            onClick={handleLeaveGroup}
            disabled={leavingGroup}
          >
            {leavingGroup ? 'Leaving...' : 'Leave Group'}
          </button>
        )}

        {groupActionError && (
          <p className="group-error" role="alert">
            {groupActionError}
          </p>
        )}

        {group.isOwner && (
          <section className="group-join-requests">
            <h3>Join Requests</h3>

            {joinRequestsLoading && (
              <p>Loading join requests...</p>
            )}

            {joinRequestsError && (
              <p className="group-error" role="alert">
                {joinRequestsError}
              </p>
            )}

            {!joinRequestsLoading &&
              !joinRequestsError &&
              joinRequests.length === 0 && (
                <p>No pending join requests.</p>
              )}

            {joinRequests.map(request => (
              <article
                key={request.userId}
                className="join-request"
              >
                <strong>{request.username}</strong>

                <div className="join-request__actions">
                  <button
                    type="button"
                    className="button-primary"
                    onClick={() =>
                      handleJoinRequestAction(
                        request.userId,
                        'PATCH',
                      )
                    }
                    disabled={joinRequestActionUserId !== null}
                  >
                    {joinRequestActionUserId === request.userId ?
                      'Saving...'
                    : 'Approve'}
                  </button>

                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() =>
                      handleJoinRequestAction(
                        request.userId,
                        'DELETE',
                      )
                    }
                    disabled={joinRequestActionUserId !== null}
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {memberList}
      </aside>

      {playlist}
    </section>
  );
}