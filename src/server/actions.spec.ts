import {describe, it, expect, vi, beforeEach} from 'vitest';
import {
  createBookmark,
  updateBookmark,
  deleteBookmark,
  addWidget,
  updateGroupLayout,
  getContainerHealth,
} from '@/server/actions';
import {getEM} from '@/lib/orm';
import {Group} from '@/models/Group';

// Ensure fresh mocks per test
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('server/actions', () => {
  it('creates, updates, and deletes a bookmark', async () => {
    const created = await createBookmark({
      name: 'Test',
      url: 'http://example.com',
      iconOnly: false,
    });
    expect(created.id).toBeTruthy();
    expect(created.name).toBe('Test');
    expect(created.url).toBe('http://example.com');
    expect(typeof created.x).toBe('number');
    expect(typeof created.y).toBe('number');
    expect(typeof created.w).toBe('number');
    expect(typeof created.h).toBe('number');

    const updated = await updateBookmark({
      id: created.id,
      name: 'Updated',
      subtext: 'desc',
      iconOnly: true,
    });
    expect(updated.name).toBe('Updated');
    expect(updated.subtext).toBe('desc');
    expect(updated.iconOnly).toBe(true);

    const del = await deleteBookmark(created.id);
    expect(del.ok).toBe(true);

    await expect(
      updateBookmark({id: created.id, name: 'nope'})
    ).rejects.toThrow('not found');
  });

  it('adds a widget to a bookmark', async () => {
    const created = await createBookmark({
      name: 'B',
      url: 'http://b.test',
    });
    const widget = await addWidget({
      bookmarkId: created.id,
      type: 'qbittorrent',
      config: {foo: 'bar'},
    });
    expect(widget.id).toBeTruthy();
    expect(widget.type).toBe('qbittorrent');
  });

  it('updates a group layout', async () => {
    // Create a group directly via ORM since there is no create action yet
    const em = await getEM();
    const g = em.create(Group, {name: 'G', x: 0, y: 0, w: 8, h: 4});
    await em.persistAndFlush(g);

    const updated = await updateGroupLayout({
      id: g.id,
      x: 2,
      y: 3,
      w: 10,
      h: 5,
    });
    expect(updated).toMatchObject({id: g.id, x: 2, y: 3, w: 10, h: 5});

    // Verify stored values
    const g2 = await em.findOne(Group, {id: g.id});
    expect(g2?.x).toBe(2);
    expect(g2?.y).toBe(3);
    expect(g2?.w).toBe(10);
    expect(g2?.h).toBe(5);
  });

  it('gets container health via docker (mocked)', async () => {
    vi.mock('dockerode', () => ({
      default: class DockerMock {
        constructor(_opts: {socketPath: string}) {
          void _opts;
        }
        getContainer(name: string) {
          // use name to avoid unused-var lint
          void name;
          return {
            inspect: async () => ({State: {Status: 'running'}}),
          };
        }
      },
    }));

    // dynamic import happens inside action, so call it after mock
    const state = await getContainerHealth('my-container');
    expect(state).toBe('running');

    const unknown = await getContainerHealth(undefined);
    expect(unknown).toBe('unknown');
  });
});
